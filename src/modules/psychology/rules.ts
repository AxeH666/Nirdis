export const ASCENDANT_IDENTITY_RULES = {
  Aries: "A direct, initiating way of meeting the world.",
  Taurus: "A steady, grounded approach to life.",
  Gemini: "A curious, adaptable manner of engaging with others.",
  Cancer: "A protective, responsive way of approaching life.",
  Leo: "A confident, expressive presence in the world.",
  Virgo: "A discerning, service-oriented approach to daily life.",
  Libra: "A balanced, relationship-oriented way of engaging.",
  Scorpio: "An intense, penetrating manner of meeting experience.",
  Sagittarius: "An expansive, questing approach to life.",
  Capricorn: "A structured, purposeful way of presenting oneself.",
  Aquarius: "An independent, forward-looking manner of engagement.",
  Pisces: "A receptive, fluid way of meeting the world.",
} as const;

export const SUN_HOUSE_LIFE_FOCUS_RULES = {
  1: "The Sun accents identity and self-expression.",
  2: "The Sun accents resources and material stability.",
  3: "The Sun accents communication and local connections.",
  4: "The Sun accents home, roots, and inner foundation.",
  5: "The Sun accents creativity and self-expression.",
  6: "The Sun accents service, health, and daily routine.",
  7: "The Sun accents partnership and one-to-one ties.",
  8: "The Sun accents transformation and shared resources.",
  9: "The Sun accents philosophy, travel, and higher meaning.",
  10: "The Sun accents vocation and public standing.",
  11: "The Sun accents community, ideals, and future vision.",
  12: "The Sun accents inner life and behind-the-scenes work.",
} as const;

export const MOON_SIGN_GROUP_EMOTIONAL_RULES = {
  fire: "A spirited, enthusiastic inner rhythm.",
  earth: "A practical, steady inner rhythm.",
  air: "A mentally engaged, sociable inner rhythm.",
  water: "A responsive, depth-oriented inner rhythm.",
} as const;

export const MOON_SIGN_TO_GROUP = {
  Aries: "fire",
  Leo: "fire",
  Sagittarius: "fire",
  Taurus: "earth",
  Virgo: "earth",
  Capricorn: "earth",
  Gemini: "air",
  Libra: "air",
  Aquarius: "air",
  Cancer: "water",
  Scorpio: "water",
  Pisces: "water",
} as const;
