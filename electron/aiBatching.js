import { AI_ERRORS } from '../src/constants/aiConstants.js';
import { getBatchSize } from './aiParser.js';
import { translateBatch } from './ai.js';

export const BATCH_SETTINGS = {
  maxRetries: 3,                  // Максимальное количество попыток при 429 ошибке
  initialRetryWaitMs: 5000,       // Начальное время ожидания (миллисекунды) при 429 ошибке
  delayBetweenBatchesMs: 3500,    // Базовая задержка между обычными батчами для предотвращения 429
  retryBackoffFactor: 2           // Насколько умножать время ожидания с каждой новой ошибкой
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function translateBatchesWithProgress(
  strings, 
  apiKey, 
  model = 'gpt-4o-mini', 
  endpointUrl = 'https://models.github.ai/inference/chat/completions', 
  onProgress = null
) {
  if (!Array.isArray(strings) || strings.length === 0) {
    return { success: false, error: AI_ERRORS.NO_TEXT };
  }

  const total = strings.length;
  const batchSize = getBatchSize(total);
  const translated = [];

  for (let index = 0; index < strings.length; index += batchSize) {
    const batch = strings.slice(index, index + batchSize);

    if (typeof onProgress === 'function') {
      const remainingBeforeBatch = total - index;
      
      onProgress({
        status: 'progress',
        total,
        completed: index,
        remaining: remainingBeforeBatch,
        batchIndex: Math.floor(index / batchSize) + 1,
        batchTotal: Math.ceil(total / batchSize),
      });
    }

    let result = null;
    let retries = BATCH_SETTINGS.maxRetries;
    let waitTime = BATCH_SETTINGS.initialRetryWaitMs;

    while (retries > 0) {
      result = await translateBatch(batch, apiKey, model, endpointUrl);
      
      // If we got a Rate Limit (429) error, we need to wait and retry
      if (!result.success && result.error && (result.error.includes('429') || result.error.toLowerCase().includes('too many requests'))) {
        retries--;
        console.warn(`[AI Translator] 429 Too Many Requests hit. Error details: ${result.error}. Waiting ${waitTime}ms and retrying... (${retries} retries left)`);
        await delay(waitTime);
        waitTime *= BATCH_SETTINGS.retryBackoffFactor; // Exponential backoff (5s -> 10s -> 20s)
        continue;
      }
      break;
    }

    if (!result.success) {
      // Return beautiful error instead of raw HTML/GitHub text
      if (result.error && result.error.includes('429')) {
        return { success: false, error: 'Превышен лимит запросов (429: Too Many Requests). Пожалуйста, подождите немного или смените модель на менее требовательную.' };
      }
      return result;
    }

    translated.push(...result.result);

    // Small baseline delay between batches to respect rate limits (RPM)
    if (index + batchSize < strings.length) {
      await delay(BATCH_SETTINGS.delayBetweenBatchesMs);
    }
  }

  if (typeof onProgress === 'function') {
    onProgress({
      status: 'progress',
      total,
      completed: total,
      remaining: 0,
      batchIndex: Math.ceil(total / batchSize),
      batchTotal: Math.ceil(total / batchSize),
    });
  }

  return { success: true, result: translated };
}
