import fetch from 'node-fetch';
import { AI_PROMPT, AI_ERRORS } from '../src/constants/aiConstants.js';
import { getBatchSize } from './aiParser.js';
import { translateBatchGithub, pingGithubLimits } from './githubApi.js';
import { translateBatchOpenRouter, pingOpenRouterLimits } from './openRouterApi.js';

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

export async function translateBatch(strings, apiKey, model) {
  if (model === 'openrouter/auto') {
    return await translateBatchOpenRouter(strings, apiKey);
  } else {
    return await translateBatchGithub(strings, apiKey, model);
  }
}

export async function pingAiLimits(apiKey, model) {
  if (model === 'openrouter/auto') {
    return await pingOpenRouterLimits(apiKey);
  } else {
    return await pingGithubLimits(apiKey, model);
  }
}
