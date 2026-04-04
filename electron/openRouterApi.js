import { AI_PROMPT, AI_ERRORS } from '../src/constants/aiConstants.js';
import { parseTranslationPayload } from './aiParser.js';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export async function translateBatchOpenRouter(strings, apiKey) {
  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/msc-dll-translator',
        'X-Title': 'MSC DLL Translator'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
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
      if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${textData}`);
      }
      throw new Error(`Invalid JSON response: ${textData}`);
    }

    if (!response.ok) {
      if (response.status === 429) {
        let retryAfter = response.headers.get('retry-after');
        let resetTime = response.headers.get('x-ratelimit-reset');
        return {
          success: false,
          error: `API Error (429) Too Many Requests`,
          status: 429,
          retryAfter: retryAfter ? parseInt(retryAfter, 10) : null,
          resetTime: resetTime ? parseInt(resetTime, 10) : null,
          apiType: 'openrouter'
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

    return { success: true, result: translatedArray, apiType: 'openrouter' };
  } catch (err) {
    return { success: false, error: err.message, apiType: 'openrouter' };
  }
}

export async function pingOpenRouterLimits(apiKey) {
  if (!apiKey) return { success: false, error: 'Укажите OpenRouter API ключ' };
  try {
    const authEndpoint = 'https://openrouter.ai/api/v1/auth/key';
    const authResponse = await fetch(authEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (authResponse.ok) {
      const authData = await authResponse.json();
      const authLimit = authData.data?.limit; // null = free tier
      
      return {
        success: true,
        limits: {
          requests: authLimit === null ? '∞ (Free)' : 'Auto',
          tokens: authLimit === null ? '∞ (Free)' : 'Auto'
        }
      };
    } else {
      return { success: false, error: 'OpenRouter Key Error' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}
