import { generateInterpretation } from "./generateInterpretation";

const mockInput = {
  summary: "Placidus natal chart with Leo rising.",
  traits: [
    { domain: "identity", tone: "soft", depth: "simple", source: "astrology", text: "A confident and expressive presence in the world." },
    { domain: "emotional_nature", tone: "soft", depth: "simple", source: "astrology", text: "A responsive and depth-oriented inner rhythm." },
    { domain: "life_theme", tone: "soft", depth: "simple", source: "astrology", text: "Life emphasis on resources and material stability." },
  ],
};

async function run() {
  const result = await generateInterpretation(mockInput);
  console.log(JSON.stringify(result, null, 2));
}

run();
