export const ASCENDANT_IDENTITY_RULES = {
  Aries: "A direct and initiating way of meeting the world.",
  Taurus: "A steady and grounded approach to life.",
  Gemini: "A curious and adaptable manner of engaging with others.",
  Cancer: "A protective and responsive way of approaching life.",
  Leo: "A confident and expressive presence in the world.",
  Virgo: "A discerning and service-oriented approach to daily life.",
  Libra: "A balanced and relationship-oriented way of engaging.",
  Scorpio: "An intense and penetrating manner of meeting experience.",
  Sagittarius: "An expansive and questing approach to life.",
  Capricorn: "A structured and purposeful way of presenting oneself.",
  Aquarius: "An individual and forward-looking manner of engagement.",
  Pisces: "A receptive and fluid way of meeting the world.",
} as const;

export const SUN_HOUSE_LIFE_FOCUS_RULES = {
  1: "Life emphasis on identity and self-expression.",
  2: "Life emphasis on resources and material stability.",
  3: "Life emphasis on communication and local connections.",
  4: "Life emphasis on home, roots, and inner foundation.",
  5: "Life emphasis on creativity and self-expression.",
  6: "Life emphasis on service, health, and daily routine.",
  7: "Life emphasis on partnership and one-to-one relationships.",
  8: "Life emphasis on transformation and shared resources.",
  9: "Life emphasis on philosophy, travel, and higher meaning.",
  10: "Life emphasis on vocation and public standing.",
  11: "Life emphasis on community, ideals, and future vision.",
  12: "Life emphasis on inner life and behind-the-scenes work.",
} as const;

export const MOON_SIGN_GROUP_EMOTIONAL_RULES = {
  fire: "A spirited and enthusiastic inner rhythm.",
  earth: "A practical and steady inner rhythm.",
  air: "A mentally engaged and sociable inner rhythm.",
  water: "A responsive and depth-oriented inner rhythm.",
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
