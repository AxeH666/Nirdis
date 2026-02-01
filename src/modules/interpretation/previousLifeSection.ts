/**
 * Formats previous_life_brief into a section for the interpretation response.
 * Combines existing fields into 3–4 sentences. Ancient, neutral tone.
 * No claims of factual reincarnation.
 */

import type { PreviousLifeBrief } from "../astrology/previousLife";

export function buildPreviousLifeSection(brief: PreviousLifeBrief): {
  title: string;
  text: string;
} {
  const sentences: string[] = [];
  sentences.push(
    `The chart suggests an inherited pattern reflected in the twelfth house: ${brief.theme}`
  );
  sentences.push(brief.carried_strengths);
  sentences.push(brief.carried_challenges);
  sentences.push(`This carries into the present life as: ${brief.present_life_shift}`);

  return {
    title: "Previous Life Themes",
    text: sentences.join(" "),
  };
}
