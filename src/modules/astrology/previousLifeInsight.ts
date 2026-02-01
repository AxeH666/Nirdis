/**
 * derivePreviousLifeInsight — enriched 12th house interpretation.
 * Uses: 12th sign, ruler, ruler's house, planets in 12th, ascendant contrast.
 * Deterministic. Symbolic inheritance only. No reincarnation claims.
 */

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

// 12th house sign → symbolic inherited theme (loss, service, withdrawal, faith, etc.)
const SIGN_THEMES: Record<string, string> = {
  Aries: "The twelfth house in Aries suggests an inherited pattern of solitude as a forge for independence.",
  Taurus: "The twelfth house in Taurus suggests an inherited pattern of seeking quiet stability and material release.",
  Gemini: "The twelfth house in Gemini suggests an inherited pattern of mental restlessness within confinement.",
  Cancer: "The twelfth house in Cancer suggests an inherited pattern of emotional depth carried from private experience.",
  Leo: "The twelfth house in Leo suggests an inherited pattern of creativity turned inward.",
  Virgo: "The twelfth house in Virgo suggests an inherited pattern of service and refinement in obscurity.",
  Libra: "The twelfth house in Libra suggests an inherited pattern of seeking harmony in isolation.",
  Scorpio: "The twelfth house in Scorpio suggests an inherited pattern of transformation through hidden depths.",
  Sagittarius: "The twelfth house in Sagittarius suggests an inherited pattern of faith tested in solitude.",
  Capricorn: "The twelfth house in Capricorn suggests an inherited pattern of discipline earned through restriction.",
  Aquarius: "The twelfth house in Aquarius suggests an inherited pattern of detachment from worldly ties.",
  Pisces: "The twelfth house in Pisces suggests an inherited pattern of dissolution, sacrifice, and surrender.",
};

// Ruler planet → unresolved pattern (what remains to be worked through)
const RULER_UNRESOLVED: Record<string, string> = {
  Sun: "The ruler indicates a carried pattern around visibility and core expression.",
  Moon: "The ruler indicates a carried pattern around boundaries and receptivity.",
  Mercury: "The ruler indicates a carried pattern around the restless mind and adaptation.",
  Venus: "The ruler indicates a carried pattern around attachment and discernment.",
  Mars: "The ruler indicates a carried pattern around force and initiative.",
  Jupiter: "The ruler indicates a carried pattern around expansion and humility.",
  Saturn: "The ruler indicates a carried pattern around structure and self-imposed limits.",
};

// House → life domain (where ruler placed = where pattern reappears)
const HOUSE_DOMAINS: Record<number, string> = {
  1: "identity and self-presentation",
  2: "resources and values",
  3: "communication and local ties",
  4: "roots, family, and inner foundation",
  5: "creativity and self-expression",
  6: "service, health, and daily routine",
  7: "partnership and open dealings",
  8: "transformation and shared resources",
  9: "philosophy, travel, and higher meaning",
  10: "vocation and public standing",
  11: "community, ideals, and future vision",
  12: "inner life and release",
};

// Planet in 12th → modifier (intensity and tone)
const PLANET_MODIFIERS: Record<string, string> = {
  Sun: "The Sun here accents vitality and purpose within the inherited theme.",
  Moon: "The Moon here accents instinct and receptivity within the inherited theme.",
  Mercury: "Mercury here accents perception and mental activity within the inherited theme.",
  Venus: "Venus here accents connection and discernment within the inherited theme.",
  Mars: "Mars here accents action and courage within the inherited theme.",
  Jupiter: "Jupiter here accents expansion and faith within the inherited theme.",
  Saturn: "Saturn here accents structure and endurance within the inherited theme.",
};

// Ascendant sign → corrective quality (what this life brings)
const ASCENDANT_CORRECTIVES: Record<string, string> = {
  Aries: "assertion and initiation",
  Taurus: "grounding and endurance",
  Gemini: "curiosity and communication",
  Cancer: "nurturing and protection",
  Leo: "confidence and expression",
  Virgo: "discernment and service",
  Libra: "balance and connection",
  Scorpio: "depth and transformation",
  Sagittarius: "expansion and faith",
  Capricorn: "structure and responsibility",
  Aquarius: "detachment and innovation",
  Pisces: "receptivity and compassion",
};

// 12th sign + Ascendant → present-life correction (contrast frames corrective direction)
function getPresentLifeCorrection(
  sign12: string,
  ascendant: string
): string {
  const ascNorm = normalizeSign(ascendant);
  const corrective = ASCENDANT_CORRECTIVES[ascNorm];
  if (!corrective) return `This life indicates a shift toward integration of the inherited pattern.`;

  return `The ascendant in ${ascendant} suggests this life emphasizes ${corrective} as a corrective to the inherited pattern.`;
}

function normalizeSign(sign: string): string {
  return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
}

export interface PreviousLifeInsight {
  theme: string;
  unresolved_pattern: string;
  carried_instincts: string;
  present_life_correction: string;
}

interface ChartInput {
  ascendant?: string;
  system?: string;
  houses?: Array<{ number: number; sign: string }>;
  planets?: Array<{ name: string; house: number }>;
}

const SUPPORTED_SYSTEMS = ["Placidus", "Whole Sign", "Koch", "Equal", "Regiomontanus"];

export function derivePreviousLifeInsight(chart: ChartInput): PreviousLifeInsight | null {
  const system = chart.system?.trim();
  if (!system || !SUPPORTED_SYSTEMS.includes(system)) return null;

  const house12 = chart.houses?.find((h) => h.number === 12);
  if (!house12?.sign) return null;

  const sign12 = normalizeSign(house12.sign);
  const theme = SIGN_THEMES[sign12];
  if (!theme) return null;

  const ruler = SIGN_RULERS[sign12];
  const rulerPlanet = chart.planets?.find((p) => p.name === ruler);
  const rulerHouse = rulerPlanet?.house ?? 12;
  const domain = HOUSE_DOMAINS[rulerHouse] ?? "inner life and release";

  const unresolved_pattern =
    (RULER_UNRESOLVED[ruler] ?? "The ruler indicates a carried pattern.") +
    ` This pattern tends to reappear in the domain of ${domain}.`;

  const planetsIn12 = chart.planets?.filter((p) => p.house === 12).map((p) => p.name) ?? [];
  let carried_instincts: string;
  if (planetsIn12.length > 0) {
    const modifiers = planetsIn12
      .map((p) => PLANET_MODIFIERS[p])
      .filter(Boolean);
    carried_instincts =
      modifiers.length > 0
        ? modifiers.join(" ")
        : `Planets in the twelfth house accent the inherited pattern.`;
  } else {
    carried_instincts = `The ruler ${ruler} reflects the tone of the inherited instincts.`;
  }

  const ascendant = chart.ascendant ?? "";
  const present_life_correction = getPresentLifeCorrection(sign12, ascendant);

  return {
    theme,
    unresolved_pattern,
    carried_instincts,
    present_life_correction,
  };
}
