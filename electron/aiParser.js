import { AI_ERRORS } from './aiConstants.js';

export function getBatchSize(total) {
  if (total <= 0) return 1;
  if (total <= 8) return 1;
  if (total <= 24) return 3;
  if (total <= 60) return 5;
  return 8;
}

export function stripCodeFences(text) {
  let result = (text || '').trim();

  if (result.startsWith('```json')) {
    result = result.replace(/^```json/i, '').replace(/```$/i, '').trim();
  } else if (result.startsWith('```')) {
    result = result.replace(/^```/i, '').replace(/```$/i, '').trim();
  }

  return result;
}

export function normalizeLine(line) {
  return line
    .replace(/^\s*[-*•]\s*/, '')
    .replace(/^\s*\d+[.)]\s*/, '')
    .trim()
    .replace(/^"(.*)"$/, '$1')
    .replace(/^'(.*)'$/, '$1');
}

export function parseTranslationPayload(rawText, expectedLength) {
  const cleaned = stripCodeFences(rawText);

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
  } catch {
    // fall through to line parsing
  }

  const lines = cleaned
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter((line) => line.length > 0);

  if (lines.length > 0) {
    return lines.slice(0, expectedLength);
  }

  throw new Error(AI_ERRORS.EMPTY_RESPONSE);
}
