export const AI_STAGES = {
  PREPARING: 'ИИ собирает строки для перевода',
  STARTING: 'ИИ начал работу по переводу строк',
  TRANSLATING: 'ИИ переводит основную часть строк',
  FINISHING: 'ИИ дочищает оставшиеся строки',
  GATHERING: 'ИИ собирает финальный результат',
  FINAL_CHECK: 'ИИ делает финальную проверку',
};

export const AI_ETA = {
  DONE: 'Готово',
  REMAINING: (remaining) => {
    if (remaining === 1) return 'Осталась 1 строка';
    if (remaining > 1 && remaining < 5) return `Осталось ${remaining} строки`;
    return `Осталось ${remaining} строк`;
  },
};

export const AI_MODELS_HELP = {
  'gpt-4o-mini': 'Быстрая и эффективная модель от GitHub.\nОграничения GitHub API: 15 запросов в минуту / 150 в день.',
  'gpt-4o': 'Сверхмощная модель от GitHub. Медленнее, но гораздо умнее.\nОграничения GitHub API: 10 запросов в минуту / 50 в день.',
  'openrouter/auto': 'Бесплатная, но самая медленная модель (Auto-Routing) от OpenRouter.\nМогут быть задержки при перегрузках.'
};

export const AI_ERRORS = {
  UNKNOWN: 'Неизвестная ошибка от нейросети.',
};
