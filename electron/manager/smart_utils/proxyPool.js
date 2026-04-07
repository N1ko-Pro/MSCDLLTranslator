const fs = require("fs");
const path = require("path");
const { ProxyAgent } = require("proxy-agent");
const { toSafeString } = require("./textUtils");

function splitProxyList(rawValue) {
  return toSafeString(rawValue)
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildProxyUrl({ protocol = "http", host, port, username, password }) {
  if (!host || !port) {
    return "";
  }

  const authPart = username
    ? `${encodeURIComponent(username)}:${encodeURIComponent(toSafeString(password))}@`
    : "";

  return `${protocol}://${authPart}${host}:${port}`;
}

function normalizeProxyEntry(entry) {
  if (typeof entry === "string") {
    return entry.trim();
  }

  if (!entry || typeof entry !== "object") {
    return "";
  }

  if (entry.url) {
    return toSafeString(entry.url).trim();
  }

  return buildProxyUrl({
    protocol: toSafeString(entry.protocol || "http").trim().toLowerCase() || "http",
    host: toSafeString(entry.host).trim(),
    port: Number(entry.port),
    username: entry.username,
    password: entry.password,
  });
}

function dedupeProxyList(proxyList) {
  return Array.from(new Set((proxyList || []).map((item) => item.trim()).filter(Boolean)));
}

function maskProxyUrl(proxyUrl) {
  try {
    const parsed = new URL(proxyUrl);
    if (parsed.username) {
      parsed.username = "***";
    }

    if (parsed.password) {
      parsed.password = "***";
    }

    return parsed.toString();
  } catch {
    return proxyUrl.replace(/\/\/(.*):(.*)@/, "//***:***@");
  }
}

function buildProxyListFromRangeConfig(config) {
  const host = toSafeString(config?.host).trim();
  const protocol = toSafeString(config?.protocol || "http").trim().toLowerCase() || "http";
  const username = config?.username;
  const password = config?.password;

  const portStart = Number(config?.portStart);
  const portEnd = Number(config?.portEnd);

  if (!host || !Number.isFinite(portStart) || !Number.isFinite(portEnd)) {
    return [];
  }

  const safeStart = Math.max(1, Math.floor(Math.min(portStart, portEnd)));
  const safeEnd = Math.max(1, Math.floor(Math.max(portStart, portEnd)));

  const proxies = [];
  for (let port = safeStart; port <= safeEnd; port += 1) {
    proxies.push(buildProxyUrl({ protocol, host, port, username, password }));
  }

  return proxies;
}

function parseProxyConfigObject(configObject) {
  if (!configObject || typeof configObject !== "object") {
    return [];
  }

  if (Array.isArray(configObject)) {
    return dedupeProxyList(configObject.map(normalizeProxyEntry));
  }

  if (Array.isArray(configObject.proxies)) {
    return dedupeProxyList(configObject.proxies.map(normalizeProxyEntry));
  }

  return dedupeProxyList(buildProxyListFromRangeConfig(configObject));
}

function loadProxyListFromFile(configFilePath) {
  if (!configFilePath) {
    return [];
  }

  const resolvedPath = path.resolve(configFilePath);
  if (!fs.existsSync(resolvedPath)) {
    return [];
  }

  try {
    const rawContent = fs.readFileSync(resolvedPath, "utf8");
    const parsed = JSON.parse(rawContent);
    return parseProxyConfigObject(parsed);
  } catch (error) {
    console.warn(`Failed to load translator proxy config from ${resolvedPath}:`, error?.message || error);
    return [];
  }
}

function loadProxyListFromEnv(env = process.env) {
  const explicitPool = splitProxyList(env.TRANSLATOR_PROXY_POOL);
  if (explicitPool.length > 0) {
    return dedupeProxyList(explicitPool);
  }

  const explicitPorts = splitProxyList(env.TRANSLATOR_PROXY_PORTS).map((value) => Number(value)).filter(Number.isFinite);
  const host = toSafeString(env.TRANSLATOR_PROXY_HOST).trim();
  if (!host) {
    return [];
  }

  const protocol = toSafeString(env.TRANSLATOR_PROXY_PROTOCOL || "http").trim().toLowerCase() || "http";
  const username = env.TRANSLATOR_PROXY_USERNAME;
  const password = env.TRANSLATOR_PROXY_PASSWORD;

  if (explicitPorts.length > 0) {
    return dedupeProxyList(explicitPorts.map((port) => buildProxyUrl({ protocol, host, port, username, password })));
  }

  const portStart = Number(env.TRANSLATOR_PROXY_PORT_START);
  const portEnd = Number(env.TRANSLATOR_PROXY_PORT_END);

  if (!Number.isFinite(portStart) || !Number.isFinite(portEnd)) {
    return [];
  }

  return dedupeProxyList(
    buildProxyListFromRangeConfig({
      protocol,
      host,
      username,
      password,
      portStart,
      portEnd,
    })
  );
}

class ProxyPoolManager {
  constructor() {
    this.proxyPool = [];
    this.currentIndex = -1;
    this.agentByProxyUrl = new Map();
  }

  setPool(proxyEntries) {
    const normalized = dedupeProxyList((proxyEntries || []).map(normalizeProxyEntry));

    this.proxyPool = normalized;
    this.currentIndex = this.proxyPool.length > 0 ? 0 : -1;
    this.agentByProxyUrl.clear();
  }

  setPoolFromConfig(configObject) {
    this.setPool(parseProxyConfigObject(configObject));
  }

  loadFromSources({ env = process.env, configFilePath } = {}) {
    const envPool = loadProxyListFromEnv(env);
    if (envPool.length > 0) {
      this.setPool(envPool);
      return { source: "env", size: envPool.length };
    }

    const filePool = loadProxyListFromFile(configFilePath);
    if (filePool.length > 0) {
      this.setPool(filePool);
      return { source: "file", size: filePool.length };
    }

    this.setPool([]);
    return { source: null, size: 0 };
  }

  hasPool() {
    return this.proxyPool.length > 0;
  }

  getPoolSize() {
    return this.proxyPool.length;
  }

  getActiveProxy() {
    if (this.currentIndex < 0 || this.currentIndex >= this.proxyPool.length) {
      return null;
    }

    return this.proxyPool[this.currentIndex];
  }

  getActiveProxyMasked() {
    const activeProxy = this.getActiveProxy();
    return activeProxy ? maskProxyUrl(activeProxy) : null;
  }

  rotate() {
    if (this.proxyPool.length <= 1) {
      return false;
    }

    this.currentIndex = (this.currentIndex + 1) % this.proxyPool.length;
    return true;
  }

  getAgent() {
    const activeProxy = this.getActiveProxy();
    if (!activeProxy) {
      return null;
    }

    if (!this.agentByProxyUrl.has(activeProxy)) {
      this.agentByProxyUrl.set(activeProxy, new ProxyAgent(activeProxy));
    }

    return this.agentByProxyUrl.get(activeProxy);
  }
}

module.exports = {
  ProxyPoolManager,
  parseProxyConfigObject,
  loadProxyListFromEnv,
  maskProxyUrl,
};
