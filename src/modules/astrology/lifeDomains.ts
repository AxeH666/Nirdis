/**
 * Life Domain Mapping (Phase 2.3.1)
 * Maps astrology houses into structured life domains.
 * Phase 2.3.2: adds deterministic descriptions.
 */
import { describeDomain } from './domainDescriptions';

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

export interface ChartHouse {
  number: number;
  sign: string;
  [key: string]: unknown;
}

export interface ChartPlanet {
  name: string;
  house: number;
  [key: string]: unknown;
}

export interface Chart {
  houses: ChartHouse[];
  planets: ChartPlanet[];
}

export interface LifeDomain {
  house: number;
  sign: string;
  ruler: string;
  planets: string[];
  description?: string;
}

function getRuler(sign: string): string {
  const normalized = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
  return SIGN_RULERS[normalized] ?? '';
}

function getPlanetsInHouse(planets: ChartPlanet[], houseNum: number): string[] {
  return planets
    .filter((p) => p.house === houseNum)
    .map((p) => p.name);
}

function findHouse(chart: Chart, houseNum: number): ChartHouse | undefined {
  return chart.houses.find((h) => h.number === houseNum);
}

export function buildLifeDomains(chart: Chart): Record<string, LifeDomain> {
  const result: Record<string, LifeDomain> = {};

  const domainMappings: Array<{
    key: string;
    houseNum: number;
    extraPlanet?: string;
  }> = [
    { key: 'identity_and_body', houseNum: 1 },
    { key: 'work_and_duty', houseNum: 6 },
    { key: 'relationships', houseNum: 7 },
    { key: 'inner_world', houseNum: 4, extraPlanet: 'Moon' },
    { key: 'growth_and_belief', houseNum: 9, extraPlanet: 'Sun' },
  ];

  for (const { key, houseNum, extraPlanet } of domainMappings) {
    const house = findHouse(chart, houseNum);
    const sign = house?.sign ?? '';
    const ruler = getRuler(sign);
    let planets = getPlanetsInHouse(chart.planets ?? [], houseNum);
    if (extraPlanet && !planets.includes(extraPlanet)) {
      planets = [...planets, extraPlanet];
    }
    const domainData = { house: houseNum, sign, ruler, planets };
    result[key] = {
      ...domainData,
      description: describeDomain(key, domainData),
    };
  }

  return result;
}
