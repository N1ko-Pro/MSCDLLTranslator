import fetch from 'node-fetch'; // В Node 18+ fetch уже встроен глобально, но оставим для совместимости
import { AI_PROMPT, AI_ERRORS } from '../src/constants/aiConstants.js';
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

    const textData = await response.text();
    let data;
    try {
      data = JSON.parse(textData);
    } catch (e) {
      if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${textData}`);
      }
      throw new Error(`Invalid JSON response: ${textData}`);
    }

    if (!response.ok) {
      throw new Error(data.error?.message || data.error || `API Error (${response.status}): ${JSON.stringify(data)}`);
    }

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

export async function pingAiLimits(apiKey, model = "gpt-4.1", endpointUrl = "https://models.github.ai/inference/chat/completions") {
  if (!apiKey) return { success: false, error: 'No API key' };
  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: '1' }],
        max_tokens: 1
      })
    });

    const requests = response.headers.get('x-ratelimit-remaining-requests');
    const tokens = response.headers.get('x-ratelimit-remaining-tokens');

    return {
      success: true,
      limits: {
        requests: requests || 'Неизвестно',
        tokens: tokens || 'Неизвестно'
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
