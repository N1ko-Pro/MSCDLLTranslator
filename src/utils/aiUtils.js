import { AI_STAGES, AI_ETA } from '../constants/aiStrings';

export const getInitialValue = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const saved = localStorage.getItem(key);
  return saved || fallback;
};

export const isValidGithubKey = (key) => /^(gh[pousr]_|github_pat_)[a-zA-Z0-9_.-]{20,}$/.test((key || '').trim());
export const isValidOpenRouterKey = (key) => /^sk-or-v1-[a-zA-Z0-9_.-]{30,}$/.test((key || '').trim());

export function formatProgressCopy(remaining, total, done = false) {
  const safeRemaining = Math.max(0, remaining || 0);
  const safeTotal = Math.max(0, total || 0);

  if (done || safeRemaining === 0) {
    return {
      stage: AI_STAGES.FINAL_CHECK,
      eta: AI_ETA.DONE,
    };
  }

  const ratio = safeTotal > 0 ? safeRemaining / safeTotal : 0;
  let stage = AI_STAGES.GATHERING;

  if (ratio > 0.80) stage = AI_STAGES.PREPARING;
  else if (ratio > 0.60) stage = AI_STAGES.STARTING;
  else if (ratio > 0.40) stage = AI_STAGES.TRANSLATING;
  else if (ratio > 0.20) stage = AI_STAGES.FINISHING;

  return { stage, eta: AI_ETA.REMAINING(safeRemaining) };
}