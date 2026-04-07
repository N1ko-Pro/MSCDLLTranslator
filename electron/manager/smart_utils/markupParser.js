const {
  MARKUP_OR_PLACEHOLDER_SPLIT_REGEX,
  MARKUP_TOKEN_REGEX,
  PLACEHOLDER_TOKEN_REGEX,
} = require("./constants");
const { toSafeString } = require("./textUtils");

function isFixedToken(token) {
  return MARKUP_TOKEN_REGEX.test(token) || PLACEHOLDER_TOKEN_REGEX.test(token);
}

function isTranslatableSegment(segment) {
  return toSafeString(segment).trim() !== "";
}

function makeSegmentKey(uid, segmentIndex) {
  return `${uid}::SEG::${segmentIndex}`;
}

function buildMarkupAwarePlan(sourceText) {
  const text = toSafeString(sourceText);
  const segments = [];

  const tokens = text
    .split(MARKUP_OR_PLACEHOLDER_SPLIT_REGEX)
    .filter((token) => token !== undefined && token !== "")
    .map((token) => {
      if (isFixedToken(token)) {
        return { type: "fixed", value: token };
      }

      const segmentIndex = segments.length;
      segments.push(token);
      return { type: "segment", index: segmentIndex };
    });

  return { tokens, segments };
}

function rebuildFromMarkupAwarePlan(plan, translatedSegments) {
  return plan.tokens
    .map((token) => {
      if (token.type === "fixed") {
        return token.value;
      }

      return translatedSegments[token.index] ?? plan.segments[token.index] ?? "";
    })
    .join("");
}

function normalizeGameMarkupSpacing(text) {
  return toSafeString(text)
    .replace(/([^\s([{<])(\[\d+\])/g, "$1 $2")
    .replace(/(\[\d+\])(?=[^\s.,;:!?\])}])/g, "$1 ")
    .replace(/([^\s([{])(<(?!\/?br\b)[A-Za-z][^>]*>)/g, "$1 $2")
    .replace(/(<\/(?!br\b)[A-Za-z][^>]*>)(?=[^\s.,;:!?\])}])/g, "$1 ");
}

module.exports = {
  isTranslatableSegment,
  makeSegmentKey,
  buildMarkupAwarePlan,
  rebuildFromMarkupAwarePlan,
  normalizeGameMarkupSpacing,
};
