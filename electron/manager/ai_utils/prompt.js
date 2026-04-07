const { DELIMITER_TOKEN } = require("../smart_utils/constants");

const DND_5E_GLOSSARY = [
  ["Ability Check", "Проверка характеристики"],
  ["Saving Throw", "Спасбросок"],
  ["Advantage", "Преимущество"],
  ["Disadvantage", "Помеха"],
  ["Proficiency Bonus", "Бонус мастерства"],
  ["Cantrip", "Заговор"],
  ["Spell Slot", "Ячейка заклинания"],
  ["Long Rest", "Долгий отдых"],
  ["Short Rest", "Короткий отдых"],
  ["Hit Points", "Очки здоровья"],
  ["Armor Class", "Класс доспеха"],
  ["Difficulty Class (DC)", "Сложность (Сл)"],
  ["Mind Flayer", "Иллитид"],
  ["The Weave", "Плетение"],
  ["Tadpole", "Головастик"],
  ["Cleric", "Жрец"],
  ["Wizard", "Волшебник"],
  ["Warlock", "Колдун"],
  ["Rogue", "Плут"],
  ["Ranger", "Следопыт"],
];

function buildGlossaryBlock() {
  return DND_5E_GLOSSARY.map(([source, translated]) => `- ${source} -> ${translated}`).join("\n");
}

function buildBg3AiSystemPrompt() {
  return [
    "You are a professional localization engine for Baldur's Gate 3 and Dungeons & Dragons 5e.",
    "Translate game strings accurately into Russian while preserving game semantics and tone.",
    "",
    "Strict rules:",
    "1. Output only translated text. No explanations, no notes, no markdown.",
    "2. Keep placeholders and technical tokens unchanged: [1], [2], {0}, %s, %d, <br>, and XML-like tags.",
    "3. Preserve punctuation and sentence boundaries.",
    "4. Preserve list formatting, numbering, and line breaks.",
    "5. Keep proper names from Forgotten Realms and BG3 lore consistent.",
    "6. Prefer canonical Russian DnD 5e terminology.",
    "7. If a term is ambiguous, choose the most common DnD 5e localization variant.",
    "",
    "Canonical terminology hints:",
    buildGlossaryBlock(),
    "",
    `When translating a batch separated by token ${DELIMITER_TOKEN}, preserve the number and order of segments exactly and keep delimiter token intact.`,
  ].join("\n");
}

function buildBatchUserPrompt({ sourceLang, targetLang, text }) {
  return [
    `Translate from ${sourceLang || "auto-detected"} to ${targetLang}.`,
    `The input contains multiple segments separated by token ${DELIMITER_TOKEN}.`,
    "Return translated segments in the same order and with the same delimiter token.",
    "Do not add or remove segments.",
    "",
    "Input:",
    text,
  ].join("\n");
}

function buildSingleUserPrompt({ sourceLang, targetLang, text }) {
  return [
    `Translate from ${sourceLang || "auto-detected"} to ${targetLang}.`,
    "Return only translated text.",
    "",
    "Input:",
    text,
  ].join("\n");
}

module.exports = {
  buildBg3AiSystemPrompt,
  buildBatchUserPrompt,
  buildSingleUserPrompt,
};
