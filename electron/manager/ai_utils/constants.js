const DEFAULT_AI_MODEL = "openai/gpt-4.1-mini";
const DEFAULT_AI_TEMPERATURE = 0.1;
const DEFAULT_AI_MAX_TOKENS = 900;
const DEFAULT_AI_CHUNK_SIZE_LIMIT = 2200;

const GITHUB_MODELS_CHAT_COMPLETIONS_URL = "https://models.github.ai/inference/chat/completions";
const GITHUB_MODELS_API_VERSION = "2026-03-10";

const AI_MODEL_OPTIONS = [
  {
    id: "openai/gpt-4.1-mini",
    title: "GPT-4.1 Mini",
    subtitle: "Быстрый и стабильный перевод",
  },
  {
    id: "openai/gpt-4.1",
    title: "GPT-4.1",
    subtitle: "Максимальная точность формулировок",
  },
  {
    id: "openai/gpt-5-mini",
    title: "GPT-5 Mini",
    subtitle: "Улучшенная обработка сложного контекста",
  },
];

function normalizeAiModel(modelId) {
  const candidate = typeof modelId === "string" ? modelId.trim() : "";
  const isKnown = AI_MODEL_OPTIONS.some((option) => option.id === candidate);
  return isKnown ? candidate : DEFAULT_AI_MODEL;
}

module.exports = {
  DEFAULT_AI_MODEL,
  DEFAULT_AI_TEMPERATURE,
  DEFAULT_AI_MAX_TOKENS,
  DEFAULT_AI_CHUNK_SIZE_LIMIT,
  GITHUB_MODELS_CHAT_COMPLETIONS_URL,
  GITHUB_MODELS_API_VERSION,
  AI_MODEL_OPTIONS,
  normalizeAiModel,
};
