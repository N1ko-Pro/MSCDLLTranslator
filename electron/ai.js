import fetch from 'node-fetch'; // В Node 18+ fetch уже встроен глобально, но оставим для совместимости или просто используем глобальный

function getBatchSize(total) {
  if (total <= 0) return 1;
  if (total <= 8) return 1;
  if (total <= 24) return 3;
  if (total <= 60) return 5;
  return 8;
}

function stripCodeFences(text) {
  let result = (text || '').trim();

  if (result.startsWith('```json')) {
    result = result.replace(/^```json/i, '').replace(/```$/i, '').trim();
  } else if (result.startsWith('```')) {
    result = result.replace(/^```/i, '').replace(/```$/i, '').trim();
  }

  return result;
}

function normalizeLine(line) {
  return line
    .replace(/^\s*[-*•]\s*/, '')
    .replace(/^\s*\d+[.)]\s*/, '')
    .trim()
    .replace(/^"(.*)"$/, '$1')
    .replace(/^'(.*)'$/, '$1');
}

function parseTranslationPayload(rawText, expectedLength) {
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

  throw new Error('Нейросеть вернула нечитаемый ответ.');
}

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
    progress({ completed = 0, remaining, stage, eta, batchIndex, batchTotal }) {
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
  const prompt = `Ты профессиональный переводчик модов для игры My Summer Car.
Твоя задача — перевести список строк на русский язык.
Правила:
1. ОБЯЗАТЕЛЬНО сохраняй все Unity теги форматирования (например: <color=green>, <b>, \n). Не переводи и не удаляй их.
2. ОБЯЗАТЕЛЬНО сохраняй переменные (например: {0}, {1}).
3. ВЕРНИ ТОЛЬКО переводы, по одному переводу на строку, в том же самом порядке и того же размера.
4. Никаких нумераций, маркеров, пояснений, markdown-разметки или лишнего текста.
5. Если строка пустая или не требует перевода, верни её как есть.`;

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
          { role: 'system', content: prompt },
          { role: 'user', content: JSON.stringify(strings) }
        ]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const translatedText = data.choices[0].message.content;
    const translatedArray = parseTranslationPayload(translatedText, strings.length);

    if (!Array.isArray(translatedArray) || translatedArray.length !== strings.length) {
      throw new Error(`Нейросеть вернула ${translatedArray.length} строк вместо ${strings.length}.`);
    }

    return { success: true, result: translatedArray };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function translateBatchesWithProgress(strings, apiKey, model = 'gpt-4o-mini', endpointUrl = 'https://models.github.ai/inference/chat/completions', onProgress = null) {
  if (!Array.isArray(strings) || strings.length === 0) {
    return { success: false, error: 'Нет текста для перевода.' };
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
