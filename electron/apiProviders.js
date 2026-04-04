import fetch from 'node-fetch';
import { AI_PROMPT, AI_ERRORS } from '../src/constants/aiConstants.js';
import { parseTranslationPayload } from './aiParser.js';

function calculateRegenerationWait(resetUnixSeconds) {
  if (!resetUnixSeconds) return 'Неизвестно';
  const now = Math.floor(Date.now() / 1000);
  const diff = parseInt(resetUnixSeconds, 10) - now;
  if (diff <= 0) return 'Уже обновлен';
  if (diff < 60) return `${diff} сек.`;
  return `${Math.ceil(diff / 60)} мин.`;
}

class BaseApiProvider {
  constructor(name, endpoint) {
    this.name = name;
    this.endpoint = endpoint;
  }

  async fetchCompletion(apiKey, model, messages, extraHeaders = {}) {
    return await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...extraHeaders
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 3500
      })
    });
  }

  async translateBatch(strings, apiKey, model) {
    try {
      const messages = [
        { role: 'system', content: AI_PROMPT },
        { role: 'user', content: JSON.stringify(strings) }
      ];
      
      const response = await this.fetchCompletion(apiKey, model, messages, this.getExtraHeaders());
      const textData = await response.text();
      
      let data;
      try {
        data = JSON.parse(textData);
      } catch (e) {
        if (!response.ok) throw new Error(`API Error (${response.status}): ${textData}`);
        throw new Error(`Invalid JSON response: ${textData}`);
      }

      if (!response.ok) {
        return this.handleRateLimitError(response, data);
      }

      if (data.error) throw new Error(data.error.message);

      const translatedText = data.choices[0].message.content;
      const translatedArray = parseTranslationPayload(translatedText, strings.length);

      if (!Array.isArray(translatedArray) || translatedArray.length !== strings.length) {
        throw new Error(AI_ERRORS.LENGTH_MISMATCH(strings.length, translatedArray ? translatedArray.length : 0));
      }

      const rateLimitInfo = this.extractRateLimitHeaders(response);

      return { 
        success: true, 
        result: translatedArray, 
        apiType: this.name,
        ...rateLimitInfo
      };
    } catch (err) {
      return { success: false, error: err.message, apiType: this.name };
    }
  }

  getExtraHeaders() { return {}; }
  
  handleRateLimitError(response, data) {
    throw new Error(data.error?.message || data.error || `API Error (${response.status})`);
  }
  
  extractRateLimitHeaders(response) { return {}; }
  
  async pingLimits(apiKey, model) {
    throw new Error('Not implemented');
  }
}

export class GithubProvider extends BaseApiProvider {
  constructor() {
    super('github', 'https://models.inference.ai.azure.com/chat/completions');
  }

  handleRateLimitError(response, data) {
    if (response.status === 429) {
      const remaining = response.headers.get('x-ratelimit-remaining-requests');
      const reset = response.headers.get('x-ratelimit-requests-reset');
      return {
        success: false,
        error: `Лимит GitHub исчерпан. Обновление через: ${calculateRegenerationWait(reset)}`,
        status: 429,
        remaining: remaining ? parseInt(remaining, 10) : 0,
        resetTime: reset ? parseInt(reset, 10) : null,
        apiType: this.name
      };
    }
    return super.handleRateLimitError(response, data);
  }

  extractRateLimitHeaders(response) {
    const remaining = response.headers.get('x-ratelimit-remaining-requests');
    const reset = response.headers.get('x-ratelimit-requests-reset');
    return {
      remaining,
      resetWait: calculateRegenerationWait(reset)
    };
  }

  async pingLimits(apiKey, model) {
    if (!apiKey) return { success: false, error: 'Укажите GitHub API ключ' };
    try {
      const messages = [{ role: 'system', content: 'ping' }, { role: 'user', content: 'ping' }];
      const response = await this.fetchCompletion(apiKey, model, messages);

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
          requests: remaining || '∞',
          tokens: remainingTokens ? `${remainingTokens} ${resetText}`.trim() : (reset ? `Обновление: ${calculateRegenerationWait(reset)}` : '∞')
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export class OpenRouterProvider extends BaseApiProvider {
  constructor() {
    super('openrouter', 'https://openrouter.ai/api/v1/chat/completions');
  }

  getExtraHeaders() {
    return {
      'HTTP-Referer': 'https://github.com/msc-dll-translator',
      'X-Title': 'MSC DLL Translator'
    };
  }

  handleRateLimitError(response, data) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const resetTime = response.headers.get('x-ratelimit-reset');
      return {
        success: false,
        error: `API Error (429) Too Many Requests`,
        status: 429,
        retryAfter: retryAfter ? parseInt(retryAfter, 10) : null,
        resetTime: resetTime ? parseInt(resetTime, 10) : null,
        apiType: this.name
      };
    }
    return super.handleRateLimitError(response, data);
  }

  async pingLimits(apiKey) {
    if (!apiKey) return { success: false, error: 'Укажите OpenRouter API ключ' };
    try {
      const authResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!authResponse.ok) {
        return { success: false, error: 'OpenRouter Key Error' };
      }
      
      const authData = await authResponse.json();
      const authLimit = authData.data?.limit; // null = free tier
      
      return {
        success: true,
        limits: {
          requests: authLimit === null ? '∞ (Free)' : 'Auto',
          tokens: authLimit === null ? '∞ (Free)' : 'Auto'
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export class ApiProviderFactory {
  static getProvider(model) {
    if (model === 'openrouter/auto') {
      return new OpenRouterProvider();
    }
    return new GithubProvider();
  }
}
