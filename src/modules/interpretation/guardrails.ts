const BANNED_WORDS = [
  "diagnosis",
  "diagnose",
  "disorder",
  "trauma",
  "therapy",
  "therapist",
  "depression",
  "anxiety",
  "bipolar",
  "ocd",
  "ptsd",
  "mental illness",
  "mental health",
  "sick",
  "disease",
  "prescription",
  "medication",
  "cure",
  "will happen",
  "will be",
  "will have",
  "you will",
  "you should",
  "you must",
  "you need to",
  "advice",
  "recommend",
  "certainly",
  "definitely",
  "guaranteed",
  "100%",
];

function stripBannedWords(text: string): string {
  let result = text;
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    result = result.replace(regex, "[removed]");
  }
  return result.replace(/\s*\[removed\]\s*/g, " ").replace(/\s+/g, " ").trim();
}

export function sanitizeOutput(output: string): string {
  return stripBannedWords(output);
}
