import { AI_ERRORS } from '../src/constants/aiConstants.js';
import { getBatchSize } from './aiParser.js';
import { translateBatch } from './ai.js';

export const BATCH_SETTINGS = {
  maxRetries: 7,
  initialRetryWaitMs: 15000, 
  delayBetweenBatchesMs: 3000,
  retryBackoffFactor: 1.5
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function translateBatchesWithProgress(
  strings, 
  apiKey, 
  model = 'gpt-4o-mini',
  endpointUrl = '', // Unused, endpoints are mapped inside logic
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

    let result = null;
    let retries = BATCH_SETTINGS.maxRetries;
    let waitTime = BATCH_SETTINGS.initialRetryWaitMs;

    while (retries > 0) {
      result = await translateBatch(batch, apiKey, model);

      if (typeof onProgress === 'function') {
        const remainingBeforeBatch = total - index;
        onProgress({
          status: 'progress',
          total,
          completed: index,
          remaining: remainingBeforeBatch,
          batchIndex: Math.floor(index / batchSize) + 1,
          batchTotal: Math.ceil(total / batchSize),
          limits: result.limits || undefined
        });
      }

      // Обработка лимита запросов (429 Too Many Requests)
      if (!result.success && result.status === 429) {
        retries--;

        let pauseMs = waitTime;
        if (result.retryAfter) {
          pauseMs = (result.retryAfter + 1) * 1000;
        } else if (result.resetTime) {
          const nowSeconds = Math.floor(Date.now() / 1000);
          const diff = result.resetTime - nowSeconds;
          if (diff > 0 && diff < 300) {
             pauseMs = (diff + 1) * 1000;
          }
        }

        console.warn(`[AI Translator] Rate limit exceeded (429). Waiting ${Math.round(pauseMs/1000)} seconds before retry... (${retries} retries left)`);

        await delay(pauseMs);
        waitTime *= BATCH_SETTINGS.retryBackoffFactor;
        continue;
      }
      break;
    }

    if (!result.success) {
      if (result.status === 429) {
        return { success: false, error: `Перевод остановлен. Исчерпан лимит сервиса. Текущий статус: ${result.resetWait || 'неизвестно'}` };
      }
      return result;
    }

    translated.push(...result.result);

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
