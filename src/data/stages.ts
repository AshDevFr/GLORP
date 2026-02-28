export interface Stage {
  stage: number;
  name: string;
  unlockAt: number;
}

export const STAGES: readonly Stage[] = [
  { stage: 0, name: "Blob", unlockAt: 0 },
  { stage: 1, name: "Spark", unlockAt: 100 },
  { stage: 2, name: "Neuron", unlockAt: 5_000 },
];
