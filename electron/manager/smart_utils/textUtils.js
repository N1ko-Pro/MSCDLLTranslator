function toSafeString(value) {
  return typeof value === "string" ? value : String(value ?? "");
}

function hasText(value) {
  return toSafeString(value).trim() !== "";
}

function normalizeLanguage(language, fallback) {
  const normalized = toSafeString(language).trim().toLowerCase();
  return normalized || fallback;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isRateLimitError(error) {
  const message = toSafeString(error?.message);
  return error?.statusCode === 429 || message.includes("429");
}

module.exports = {
  toSafeString,
  hasText,
  normalizeLanguage,
  escapeRegExp,
  isRateLimitError,
};
