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
  'gpt-4o-mini': 'Более быстрая модель. Хороша для массовых переводов и коротких строк.',
  'gpt-5-mini': 'Более умная модель. Лучше подходит для сложного контекста и тонких формулировок.',
};

export const AI_ERRORS = {
  UNKNOWN: 'Неизвестная ошибка от нейросети.',
};
