import { AI_ERRORS } from '../src/constants/aiConstants.js';
import { getBatchSize } from './aiParser.js';
import { ApiProviderFactory } from './apiProviders.js';

const BATCH_SETTINGS = {
  maxRetries: 7,
  initialRetryWaitMs: 15000, 
  delayBetweenBatchesMs: 3000,
  retryBackoffFactor: 1.5
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function pingAiLimits(apiKey, model, _endpointUrl) {
  const provider = ApiProviderFactory.getProvider(model);
  return await provider.pingLimits(apiKey, model);
}

export async function translateAi(event, { strings, apiKey, model, endpointUrl }) {
  if (!strings || strings.length === 0) return { success: false, error: 'Нет текста для перевода.' };
  if (!apiKey) return { success: false, error: 'Необходим API Ключ.' };

  const total = strings.length;
  const activeModel = model || 'gpt-4o-mini';
  const activeEndpoint = endpointUrl || 'https://models.github.ai/inference/chat/completions';
  
  const progressReporter = createAiProgressReporter(event.sender, {
    model: activeModel,
    endpointUrl: activeEndpoint,
    total,
  });

  progressReporter.start();

  try {
    const result = await translateBatchesWithProgress({
      strings,
      apiKey,
      model: activeModel,
      provider: ApiProviderFactory.getProvider(activeModel),
      onProgress: (payload) => progressReporter.progress(payload)
    });

    if (result.success) {
      progressReporter.done();
    } else {
      progressReporter.error(result.error);
    }

    return result;
  } catch (err) {
    progressReporter.error(err.message);
    return { success: false, error: err.message };
  }
}

function createAiProgressReporter(sender, { model, endpointUrl, total }) {
  const send = (payload) => {
    if (!sender || sender.isDestroyed()) return;
    sender.send('translate-ai-progress', { model, endpointUrl, ...payload });
  };

  const getProgress = (completed) => {
    if (!total || total <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
  };

  return {
    start() {
      send({ status: 'started', total, completed: 0, remaining: total, progress: 0 });
    },
    progress({ completed = 0, remaining, batchIndex, batchTotal, limits }) {
      const safeCompleted = Math.max(0, completed);
      const safeRemaining = Number.isFinite(remaining) ? remaining : Math.max(0, total - safeCompleted);
      send({
        status: 'progress',
        total,
        completed: safeCompleted,
        remaining: safeRemaining,
        progress: getProgress(safeCompleted),
        batchIndex,
        batchTotal,
        limits,
      });
    },
    done() {
      send({ status: 'done', total, completed: total, remaining: 0, progress: 100 });
    },
    error(message) {
      send({ status: 'error', total, completed: 0, remaining: total, progress: 0, error: message });
    },
  };
}

async function translateBatchesWithProgress({ strings, apiKey, model, provider, onProgress }) {
  const total = strings.length;
  const batchSize = getBatchSize(total);
  const translated = [];

  for (let index = 0; index < strings.length; index += batchSize) {
    const batch = strings.slice(index, index + batchSize);
    let result = null;
    let retries = BATCH_SETTINGS.maxRetries;
    let waitTime = BATCH_SETTINGS.initialRetryWaitMs;

    while (retries > 0) {
      result = await provider.translateBatch(batch, apiKey, model);

      if (onProgress) {
        onProgress({
          completed: index,
          remaining: total - index,
          batchIndex: Math.floor(index / batchSize) + 1,
          batchTotal: Math.ceil(total / batchSize),
          limits: result.limits || undefined
        });
      }

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

        console.warn(`[AI Translator] Rate limit (429). Waiting ${Math.round(pauseMs/1000)}s... (${retries} retries left)`);
        await delay(pauseMs);
        waitTime *= BATCH_SETTINGS.retryBackoffFactor;
        continue;
      }
      break;
    }

    if (!result.success) {
      if (result.status === 429) {
        return { success: false, error: `Перевод остановлен. Исчерпан лимит сервиса. Статус: ${result.resetWait || 'неизвестно'}` };
      }
      return result;
    }

    translated.push(...result.result);
  }

  if (onProgress) {
    onProgress({
      completed: total,
      remaining: 0,
      batchIndex: Math.ceil(total / batchSize),
      batchTotal: Math.ceil(total / batchSize),
    });
  }

  return { success: true, result: translated };
}
