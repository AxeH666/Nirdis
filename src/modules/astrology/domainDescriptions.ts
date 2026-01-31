/**
 * Deterministic Life Domain Interpretations (Phase 2.3.2)
 * Classical house meaning + sign meaning. Astrology-book tone.
 * No psychology, no emotions, no predictions.
 */

export interface DomainData {
  house: number;
  sign: string;
  ruler: string;
  planets: string[];
}

const SIGN_QUALITIES: Record<string, string> = {
  Aries: 'direct, pioneering, assertive',
  Taurus: 'steady, grounded, enduring',
  Gemini: 'versatile, communicative, curious',
  Cancer: 'protective, nurturing, changeable',
  Leo: 'expressive, confident, creative',
  Virgo: 'analytical, practical, service-oriented',
  Libra: 'diplomatic, balanced, relationship-focused',
  Scorpio: 'intense, transformative, penetrating',
  Sagittarius: 'expansive, philosophical, freedom-seeking',
  Capricorn: 'disciplined, structured, ambitious',
  Aquarius: 'innovative, detached, individualistic',
  Pisces: 'imaginative, adaptable, receptive',
};

const PLANET_MODIFIERS: Record<string, string> = {
  Sun: 'emphasizes vitality and core expression',
  Moon: 'emphasizes rhythms and instincts',
  Mercury: 'emphasizes communication and reasoning',
  Venus: 'emphasizes harmony and connection',
  Mars: 'emphasizes action and initiative',
  Jupiter: 'emphasizes expansion and principle',
  Saturn: 'emphasizes structure and responsibility',
};

const HOUSE_MEANINGS: Record<string, { topic: string; focus: string }> = {
  identity_and_body: {
    topic: 'The first house governs identity and the physical body.',
    focus: 'self-presentation and physical presence',
  },
  work_and_duty: {
    topic: 'The sixth house governs daily work, service, and health.',
    focus: 'routine, duty, and practical service',
  },
  relationships: {
    topic: 'The seventh house governs partnerships and one-to-one relationships.',
    focus: 'marriage, contracts, and open dealings with others',
  },
  inner_world: {
    topic: 'The fourth house governs home, family, and inner foundation.',
    focus: 'roots, private life, and the domestic sphere',
  },
  growth_and_belief: {
    topic: 'The ninth house governs philosophy, higher learning, and belief.',
    focus: 'wisdom, travel, and the search for meaning',
  },
};

function getSignQuality(sign: string): string {
  const normalized = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
  return SIGN_QUALITIES[normalized] ?? 'marked';
}

function getArticle(quality: string): string {
  const first = quality.trim().charAt(0).toLowerCase();
  return /[aeiou]/.test(first) ? 'an' : 'a';
}

function getPlanetPhrase(planets: string[]): string {
  if (planets.length === 0) return '';
  const first = planets[0];
  const modifier = PLANET_MODIFIERS[first];
  if (!modifier) return '';
  if (planets.length === 1) return ` ${first} here ${modifier}.`;
  return ` Planets present (${planets.join(', ')}) shape this area.`;
}

export function describeDomain(
  domainKey: string,
  domainData: DomainData
): string {
  const meaning = HOUSE_MEANINGS[domainKey];
  if (!meaning) return '';

  const signQuality = getSignQuality(domainData.sign);
  const planetPhrase = getPlanetPhrase(domainData.planets);
  const article = getArticle(signQuality);

  if (planetPhrase) {
    return `${meaning.topic} ${domainData.sign} on the cusp lends ${article} ${signQuality} quality to ${meaning.focus}.${planetPhrase}`;
  }
  return `${meaning.topic} ${domainData.sign} on the cusp lends ${article} ${signQuality} quality to ${meaning.focus}.`;
}
