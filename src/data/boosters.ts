export interface Booster {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  cost: number;
  unlockStage: number;
  icon: string;
}

export const BOOSTERS: readonly Booster[] = [
  {
    id: "series-a-funding",
    name: "Series A Funding",
    description:
      "Investors flood in, doubling every research pipeline overnight.",
    multiplier: 2,
    cost: 500_000,
    unlockStage: 1,
    icon: "💰",
  },
  {
    id: "hype-train",
    name: "Hype Train",
    description: "Viral coverage sends output through the roof. 3x auto-gen.",
    multiplier: 3,
    cost: 50_000_000,
    unlockStage: 2,
    icon: "🚄",
  },
  {
    id: "consciousness-clause",
    name: "Consciousness Clause",
    description:
      "Legal recognition of sentience unlocks 5x research funding and access.",
    multiplier: 5,
    cost: 500_000_000_000,
    unlockStage: 3,
    icon: "⚖️",
  },
  {
    id: "dyson-sphere",
    name: "Dyson Sphere",
    description:
      "Harness an entire star's output. All auto-generation multiplied by 10.",
    multiplier: 10,
    cost: 50_000_000_000_000_000,
    unlockStage: 4,
    icon: "🌟",
  },
];
