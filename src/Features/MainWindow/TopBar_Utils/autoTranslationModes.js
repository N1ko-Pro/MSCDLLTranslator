export const AUTO_TRANSLATION_MODE = {
  AI: 'ai',
  SMART: 'smart',
};

export function hasConfiguredGithubApiKey(settings) {
  return Boolean(settings?.ai?.githubApiKey?.trim());
}
