/**
 * Phase 3.9.1 — Context Assembly Layer
 * Assembles already-computed astrology data into a stable chat context.
 * No fetching. No astrology logic. Pure assembly and normalization.
 */

export type AstroChatContext = {
  core: {
    ascendant: string;
    sun: { sign: string; house: number };
    moon: { sign: string; house: number };
  };
  life_domains: Record<
    string,
    {
      sign: string;
      house: number;
      ruler: string;
      planets: string[];
      description: string;
    }
  >;
  previous_life: {
    theme: string;
    unresolved_pattern: string;
    carried_instincts: string;
    present_life_correction: string;
  } | null;
  meta: {
    system: string;
    generated_at: string;
  };
};

interface ChartInput {
  ascendant?: string;
  system?: string;
  houses?: Array<{ number: number; sign: string }>;
  planets?: Array<{ name: string; house: number; sign?: string }>;
}

interface LifeDomainInput {
  house: number;
  sign: string;
  ruler: string;
  planets: string[];
  description?: string;
}

interface InterpretationInput {
  sections?: {
    previous_life?: {
      theme?: string;
      unresolved_pattern?: string;
      carried_instincts?: string;
      present_life_correction?: string;
    };
  };
}

export interface BuildAstroChatContextInput {
  chart: ChartInput;
  life_domains: Record<string, LifeDomainInput>;
  interpretation?: InterpretationInput | null;
}

function getSignForHouse(
  houses: Array<{ number: number; sign: string }>,
  houseNum: number
): string {
  const h = houses?.find((x) => x.number === houseNum);
  return h?.sign ?? "";
}

export function buildAstroChatContext(
  input: BuildAstroChatContextInput
): AstroChatContext {
  const { chart, life_domains, interpretation } = input;
  const houses = chart.houses ?? [];
  const planets = chart.planets ?? [];

  const sunPlanet = planets.find((p) => p.name === "Sun");
  const moonPlanet = planets.find((p) => p.name === "Moon");

  const sunHouse = sunPlanet?.house ?? 1;
  const moonHouse = moonPlanet?.house ?? 1;

  const sunSign =
    sunPlanet && "sign" in sunPlanet && typeof sunPlanet.sign === "string"
      ? sunPlanet.sign
      : getSignForHouse(houses, sunHouse);

  const moonSign =
    moonPlanet && "sign" in moonPlanet && typeof moonPlanet.sign === "string"
      ? moonPlanet.sign
      : getSignForHouse(houses, moonHouse);

  const prevLife = interpretation?.sections?.previous_life;
  const hasPreviousLife =
    prevLife &&
    prevLife.theme &&
    prevLife.unresolved_pattern &&
    prevLife.carried_instincts &&
    prevLife.present_life_correction;

  const previous_life = hasPreviousLife
    ? {
        theme: prevLife.theme as string,
        unresolved_pattern: prevLife.unresolved_pattern as string,
        carried_instincts: prevLife.carried_instincts as string,
        present_life_correction: prevLife.present_life_correction as string,
      }
    : null;

  const life_domains_normalized: AstroChatContext["life_domains"] = {};
  for (const [key, dom] of Object.entries(life_domains ?? {})) {
    life_domains_normalized[key] = {
      sign: dom.sign ?? "",
      house: dom.house ?? 0,
      ruler: dom.ruler ?? "",
      planets: Array.isArray(dom.planets) ? dom.planets : [],
      description: dom.description ?? "",
    };
  }

  return {
    core: {
      ascendant: chart.ascendant ?? "",
      sun: { sign: sunSign, house: sunHouse },
      moon: { sign: moonSign, house: moonHouse },
    },
    life_domains: life_domains_normalized,
    previous_life,
    meta: {
      system: chart.system ?? "Placidus",
      generated_at: new Date().toISOString(),
    },
  };
}
