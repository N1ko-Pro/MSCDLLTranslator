import { AI_PROMPT, AI_ERRORS } from '../src/constants/aiConstants.js';
import { parseTranslationPayload } from './aiParser.js';

const GITHUB_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';

function calculateRegenerationWait(resetUnixSeconds) {
  if (!resetUnixSeconds) return 'Неизвестно';
  const now = Math.floor(Date.now() / 1000);
  const diff = parseInt(resetUnixSeconds, 10) - now;
  if (diff <= 0) return 'Уже обновлен';
  if (diff < 60) return `${diff} сек.`;
  return `${Math.ceil(diff / 60)} мин.`;
}

export async function translateBatchGithub(strings, apiKey, model) {
  try {
    const response = await fetch(GITHUB_ENDPOINT, {
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
        ],
        max_tokens: 3500
      })
    });

    const textData = await response.text();
    let data;
    try {
      data = JSON.parse(textData);
    } catch (e) {
      if (!response.ok) throw new Error(`API Error (${response.status}): ${textData}`);
      throw new Error(`Invalid JSON response: ${textData}`);
    }

    const remaining = response.headers.get('x-ratelimit-remaining-requests');
    const reset = response.headers.get('x-ratelimit-requests-reset');

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: `Лимит GitHub исчерпан. Обновление через: ${calculateRegenerationWait(reset)}`,
          status: 429,
          remaining: remaining ? parseInt(remaining, 10) : 0,
          resetTime: reset ? parseInt(reset, 10) : null,
          apiType: 'github'
        };
      }
      throw new Error(data.error?.message || data.error || `API Error (${response.status})`);
    }

    if (data.error) throw new Error(data.error.message);

    const translatedText = data.choices[0].message.content;
    const translatedArray = parseTranslationPayload(translatedText, strings.length);

    if (!Array.isArray(translatedArray) || translatedArray.length !== strings.length) {
      throw new Error(AI_ERRORS.LENGTH_MISMATCH(strings.length, translatedArray ? translatedArray.length : 0));
    }

    return { 
      success: true, 
      result: translatedArray,
      apiType: 'github',
      remaining: remaining,
      resetWait: calculateRegenerationWait(reset)
    };
  } catch (err) {
    return { success: false, error: err.message, apiType: 'github' };
  }
}

export async function pingGithubLimits(apiKey, model) {
  if (!apiKey) return { success: false, error: 'Укажите GitHub API ключ' };
  try {
    const response = await fetch(GITHUB_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'system', content: 'ping' }, { role: 'user', content: 'ping' }],
        max_tokens: 10
      })
    });

    const remaining = response.headers.get('x-ratelimit-remaining-requests');
    const remainingTokens = response.headers.get('x-ratelimit-remaining-tokens');
    const reset = response.headers.get('x-ratelimit-requests-reset');

    const resetText = reset ? `(Обновл: ${calculateRegenerationWait(reset)})` : '';
    
    if (response.status === 429) {
       return {
         success: true,
         limits: {
           requests: '0',
           tokens: `0 ${resetText}`.trim()
         }
       };
    }

    if (response.status === 401 || response.status === 403) {
      return { success: false, error: 'Неверный GitHub API ключ' };
    }

    return {
      success: true,
      limits: {
        requests: remaining ? remaining : '∞',
        tokens: remainingTokens ? `${remainingTokens} ${resetText}`.trim() : (reset ? `Обновление: ${calculateRegenerationWait(reset)}` : '∞')
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
