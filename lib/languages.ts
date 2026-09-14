export const LANGUAGE_CODES = [
  "en",
  "es",
  "de",
  "fr",
  "it",
  "pt",
  "tr",
  "nl",
  "sv",
  "no",
  "da",
  "fi",
  "hi",
  "vi",
  "ar",
  "he",
  "ja",
  "ur",
  "zh",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  tr: "Turkish",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  hi: "Hindi",
  vi: "Vietnamese",
  ar: "Arabic",
  he: "Hebrew",
  ja: "Japanese",
  ur: "Urdu",
  zh: "Chinese",
};

export const REWRITE_PRESETS = [
  {
    id: "default",
    label: "Default cleanup",
    instruction: "",
  },
  {
    id: "tidy",
    label: "Tidy punctuation",
    instruction: "Remove filler words and tidy the punctuation.",
  },
  {
    id: "email",
    label: "As an email",
    instruction: "Rewrite as a concise email.",
  },
  {
    id: "tasks",
    label: "As action items",
    instruction: "Rewrite as action item bullets.",
  },
] as const;
