const {
  GITHUB_MODELS_CHAT_COMPLETIONS_URL,
  GITHUB_MODELS_API_VERSION,
  DEFAULT_AI_TEMPERATURE,
  DEFAULT_AI_MAX_TOKENS,
} = require("./constants");
const { toSafeString } = require("../smart_utils/textUtils");

let resolvedFetch = null;

async function getFetchImplementation() {
  if (resolvedFetch) {
    return resolvedFetch;
  }

  if (typeof fetch === "function") {
    resolvedFetch = fetch;
    return resolvedFetch;
  }

  const imported = await import("node-fetch");
  resolvedFetch = imported.default;
  return resolvedFetch;
}

function extractMessageText(content) {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (!item || typeof item !== "object") {
        return "";
      }

      if (typeof item.text === "string") {
        return item.text;
      }

      return "";
    })
    .join("");
}

function extractAssistantText(payload) {
  const choice = Array.isArray(payload?.choices) ? payload.choices[0] : null;
  const message = choice?.message;
  return toSafeString(extractMessageText(message?.content)).trim();
}

function toProviderError(status, bodyText) {
  if (status === 401 || status === 403) {
    return new Error("AI_AUTH_FAILED");
  }

  if (status === 429) {
    const err = new Error("RATE_LIMIT_EXCEEDED");
    err.statusCode = 429;
    return err;
  }

  const safeBody = toSafeString(bodyText).slice(0, 400);
  return new Error(`AI_PROVIDER_HTTP_${status}: ${safeBody}`);
}

async function requestGithubChatCompletion({
  apiKey,
  model,
  messages,
  temperature = DEFAULT_AI_TEMPERATURE,
  maxTokens = DEFAULT_AI_MAX_TOKENS,
  timeoutMs = 45000,
}) {
  const fetchImpl = await getFetchImplementation();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(GITHUB_MODELS_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${apiKey}`,
        "X-GitHub-Api-Version": GITHUB_MODELS_API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
      signal: controller.signal,
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw toProviderError(response.status, responseText);
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      throw new Error("AI_PROVIDER_INVALID_JSON");
    }

    const assistantText = extractAssistantText(parsed);
    if (!assistantText) {
      throw new Error("AI_EMPTY_RESPONSE");
    }

    return assistantText;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  requestGithubChatCompletion,
};
