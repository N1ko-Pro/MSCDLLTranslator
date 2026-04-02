import fetch from 'node-fetch'; // В Node 18+ fetch уже встроен глобально, но оставим для совместимости
import { AI_PROMPT, AI_ERRORS } from './aiConstants.js';
import { getBatchSize, parseTranslationPayload } from './aiParser.js';

export function createAiProgressReporter(sender, { model, endpointUrl, total }) {
  const send = (payload) => {
    if (!sender || sender.isDestroyed()) return;

    sender.send('translate-ai-progress', {
      model,
      endpointUrl,
      ...payload,
    });
  };

  const getProgress = (completed) => {
    if (!total || total <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
  };

  return {
    start() {
      send({
        status: 'started',
        total,
        completed: 0,
        remaining: total,
        progress: 0,
      });
    },
    progress({ completed = 0, remaining, batchIndex, batchTotal }) {
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
      });
    },

    done() {
      send({
        status: 'done',
        total,
        completed: total,
        remaining: 0,
        progress: 100,
      });
    },
    error(message) {
      send({
        status: 'error',
        total,
        completed: 0,
        remaining: total,
        progress: 0,
        error: message,
      });
    },
  };
}

export async function translateBatch(strings, apiKey, model = "gpt-4o-mini", endpointUrl = "https://models.github.ai/inference/chat/completions") {
  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: AI_PROMPT },
          { role: 'user', content: JSON.stringify(strings) }
        ]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const translatedText = data.choices[0].message.content;
    const translatedArray = parseTranslationPayload(translatedText, strings.length);

    if (!Array.isArray(translatedArray) || translatedArray.length !== strings.length) {
      throw new Error(AI_ERRORS.LENGTH_MISMATCH(strings.length, translatedArray ? translatedArray.length : 0));
    }

    return { success: true, result: translatedArray };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function translateBatchesWithProgress(strings, apiKey, model = 'gpt-4o-mini', endpointUrl = 'https://models.github.ai/inference/chat/completions', onProgress = null) {
  if (!Array.isArray(strings) || strings.length === 0) {
    return { success: false, error: AI_ERRORS.NO_TEXT };
  }


  const total = strings.length;
  const batchSize = getBatchSize(total);
  const translated = [];

  for (let index = 0; index < strings.length; index += batchSize) {
    const batch = strings.slice(index, index + batchSize);
    const completedBeforeBatch = index;
    const remainingBeforeBatch = total - completedBeforeBatch;

    if (typeof onProgress === 'function') {
      onProgress({
        status: 'progress',
        total,
        completed: completedBeforeBatch,
        remaining: remainingBeforeBatch,
        batchIndex: Math.floor(index / batchSize) + 1,
        batchTotal: Math.ceil(total / batchSize),
      });
    }

    const result = await translateBatch(batch, apiKey, model, endpointUrl);
    if (!result.success) {
      return result;
    }

    translated.push(...result.result);

    const completed = Math.min(total, index + batch.length);
    const remaining = total - completed;

    if (typeof onProgress === 'function') {
      onProgress({
        status: 'progress',
        total,
        completed,
        remaining,
        batchIndex: Math.floor(index / batchSize) + 1,
        batchTotal: Math.ceil(total / batchSize),
      });
    }
  }

  return { success: true, result: translated };
}
