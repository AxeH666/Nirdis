import type { InterpretationInput, InterpretationOutput } from "./types";

function traitByDomain(traits: InterpretationInput["traits"], domain: string): string {
  const t = traits.find((x) => x.domain === domain);
  return t?.text ?? "";
}

function buildFallback(input: InterpretationInput): InterpretationOutput {
  const identity = traitByDomain(input.traits, "identity");
  const emotional = traitByDomain(input.traits, "emotional_nature");
  const lifeFocus = traitByDomain(input.traits, "life_theme");

  return {
    narrative: input.summary + " The chart suggests a particular blend of identity, inner rhythm, and life emphasis.",
    sections: {
      identity: identity || "The first house and ascendant describe the approach to the world.",
      emotional_nature: emotional || "The Moon placement reflects inner rhythms and responsiveness.",
      life_focus: lifeFocus || "The Sun house indicates where life emphasis tends to fall.",
      integration: "These factors combine in the chart. Each area informs the others.",
    },
  };
}

export { buildFallback };
