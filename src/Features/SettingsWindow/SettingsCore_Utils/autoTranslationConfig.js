import { Gauge, Layers3, ShieldCheck, Sparkles } from 'lucide-react';

export const MODEL_X = 'model-x';
const MODEL_COMPAT = 'model-compat';
const DEFAULT_AI_MODEL = 'openai/gpt-4.1-mini';

export const AI_MODEL_OPTIONS = [
  { id: 'openai/gpt-4.1-mini', title: 'GPT-4.1 Mini', subtitle: 'Быстрый и стабильный перевод' },
  { id: 'openai/gpt-4.1', title: 'GPT-4.1', subtitle: 'Высокая точность формулировок' },
  { id: 'openai/gpt-5-mini', title: 'GPT-5 Mini', subtitle: 'Сложный контекст и нюансы стиля' },
];

export function normalizeAiModel(modelId) {
  const candidate = typeof modelId === 'string' ? modelId.trim() : '';
  const isKnown = AI_MODEL_OPTIONS.some((option) => option.id === candidate);
  return isKnown ? candidate : DEFAULT_AI_MODEL;
}

export function getAiModelLabel(modelId) {
  const normalized = normalizeAiModel(modelId);
  const matched = AI_MODEL_OPTIONS.find((option) => option.id === normalized);
  return matched ? matched.title : 'AI model';
}

export function getModelByMethod(method) {
  if (method === 'compatibility') return MODEL_COMPAT;
  return MODEL_X;
}

export const AUTO_TRANSLATION_MODELS = [
  { id: MODEL_X, title: 'Модель 1', subtitle: 'google-translate-api-x', icon: Sparkles },
  { id: MODEL_COMPAT, title: 'Модель 2', subtitle: '@vitalets/google-translate-api', icon: ShieldCheck },
];

export const AUTO_TRANSLATION_METHODS_BY_MODEL = {
  [MODEL_X]: [
    {
      id: 'single',
      name: 'Single',
      description: 'Переводит каждую строку отдельно. Максимальная точность и аккуратная работа с короткими фразами.',
      badge: 'Точность',
      icon: Sparkles,
      color: 'text-emerald-300',
      bg: 'bg-emerald-400/10',
    },
    {
      id: 'standard',
      name: 'Batch',
      description: 'Обрабатывает строки пакетами. Более стабильный режим для крупных модов и больших объемов текста.',
      badge: 'Стабильность',
      icon: Layers3,
      color: 'text-amber-300',
      bg: 'bg-amber-400/10',
    },
  ],
  [MODEL_COMPAT]: [
    {
      id: 'compatibility',
      name: 'Стандарт',
      description:
        'Классическая библиотека с одним проверенным режимом. Хороший резервный вариант при нестабильной работе основной модели.',
      badge: 'Fallback',
      icon: Gauge,
      color: 'text-sky-300',
      bg: 'bg-sky-400/10',
    },
  ],
};
