/**
 * Previous Life Brief — 12th house interpretation.
 * The 12th house (tradition) rules the subconscious, past karma, and what is carried forward.
 * Deterministic, no predictions. Ancient, grounded tone.
 */

const SUPPORTED_SYSTEMS = ["Placidus", "Whole Sign", "Koch", "Equal", "Regiomontanus"];

const SIGN_RULERS: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

// 12th house sign → theme (inherited pattern from prior experience)
const SIGN_THEMES: Record<string, string> = {
  Aries: "A tendency toward solitude as a forge for independence.",
  Taurus: "An inherited pattern of seeking quiet stability and material release.",
  Gemini: "An inherited pattern of mental restlessness in confinement.",
  Cancer: "A tendency toward emotional depth carried from private experience.",
  Leo: "An inherited pattern of creativity turned inward.",
  Virgo: "A tendency toward service rendered in obscurity.",
  Libra: "An inherited pattern of seeking harmony in isolation.",
  Scorpio: "A tendency toward transformation through hidden depths.",
  Sagittarius: "An inherited pattern of faith tested in solitude.",
  Capricorn: "A tendency toward discipline earned through restriction.",
  Aquarius: "An inherited pattern of detachment from worldly ties.",
  Pisces: "A tendency toward dissolution of boundaries and surrender.",
};

// Ruler planet → strength carried forward
const RULER_STRENGTHS: Record<string, string> = {
  Sun: "A carried strength in vitality and purpose.",
  Moon: "A carried strength in instinct and receptivity.",
  Mercury: "A carried strength in perception and adaptation.",
  Venus: "A carried strength in connection and discernment.",
  Mars: "A carried strength in courage and initiative.",
  Jupiter: "A carried strength in faith and expansion.",
  Saturn: "A carried strength in endurance and structure.",
};

// Ruler planet → challenge carried forward
const RULER_CHALLENGES: Record<string, string> = {
  Sun: "A carried challenge in expressing the core self openly.",
  Moon: "A carried challenge in boundaries between self and other.",
  Mercury: "A carried challenge in quieting the restless mind.",
  Venus: "A carried challenge in releasing attachment to outcomes.",
  Mars: "A carried challenge in channeling force without aggression.",
  Jupiter: "A carried challenge in humility amid expansion.",
  Saturn: "A carried challenge in softening self-imposed limits.",
};

// 12th house sign → present-life shift emphasis
const SIGN_SHIFTS: Record<string, string> = {
  Aries: "This life emphasizes bringing hidden fire into visible action.",
  Taurus: "This life emphasizes grounding what was once unmoored.",
  Gemini: "This life emphasizes giving voice to what was silent.",
  Cancer: "This life emphasizes nurturing what was held back.",
  Leo: "This life emphasizes shining what was kept in shadow.",
  Virgo: "This life emphasizes practical use of refined discernment.",
  Libra: "This life emphasizes balance between solitude and connection.",
  Scorpio: "This life emphasizes conscious use of transformative power.",
  Sagittarius: "This life emphasizes embodying faith in daily life.",
  Capricorn: "This life emphasizes building structure from restriction.",
  Aquarius: "This life emphasizes connecting inner vision to the collective.",
  Pisces: "This life emphasizes navigating compassion without losing self.",
};

interface ChartInput {
  system?: string;
  houses?: Array<{ number: number; sign: string }>;
  planets?: Array<{ name: string; house: number }>;
}

export interface PreviousLifeBrief {
  theme: string;
  carried_strengths: string;
  carried_challenges: string;
  present_life_shift: string;
}

function normalizeSign(sign: string): string {
  return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
}

function getRuler(sign: string): string {
  const n = normalizeSign(sign);
  return SIGN_RULERS[n] ?? "";
}

export function generatePreviousLifeBrief(chart: ChartInput): PreviousLifeBrief | null {
  const system = chart.system?.trim();
  if (!system || !SUPPORTED_SYSTEMS.includes(system)) {
    return null;
  }

  const house12 = chart.houses?.find((h) => h.number === 12);
  if (!house12?.sign) {
    return null;
  }

  const sign = normalizeSign(house12.sign);
  const theme = SIGN_THEMES[sign];
  const ruler = getRuler(sign);
  const carried_strengths = RULER_STRENGTHS[ruler] ?? "A carried strength in resilience.";
  const carried_challenges = RULER_CHALLENGES[ruler] ?? "A carried challenge in release.";
  const present_life_shift = SIGN_SHIFTS[sign];

  if (!theme || !present_life_shift) {
    return null;
  }

  // Planets in 12th house accent the interpretation (traditional: tenants modify house themes)
  const planetsIn12 = chart.planets?.filter((p) => p.house === 12).map((p) => p.name) ?? [];
  const planetList = planetsIn12.join(" and ");
  const planetVerb = planetsIn12.length === 1 ? "accents" : "accent";
  const planetNote =
    planetsIn12.length > 0 ? ` ${planetList} in the twelfth house ${planetVerb} these matters.` : "";

  return {
    theme,
    carried_strengths: carried_strengths + planetNote,
    carried_challenges,
    present_life_shift,
  };
}
