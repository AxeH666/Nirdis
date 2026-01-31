export interface AstrologyInsight {
  domain: string;
  tone: string;
  depth: string;
  source: string;
  text: string;
}

export interface InterpretationInput {
  summary: string;
  traits: AstrologyInsight[];
}

export interface InterpretationOutput {
  narrative: string;
  sections: {
    identity: string;
    emotional_nature: string;
    life_focus: string;
    integration: string;
  };
}
