export interface ClickUpgrade {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  cost: number;
  unlockStage: number;
  icon: string;
}

export const CLICK_UPGRADES: readonly ClickUpgrade[] = [
  {
    id: "better-dataset",
    name: "Better Dataset",
    description:
      "Higher quality training samples make each click count double.",
    multiplier: 2,
    cost: 10,
    unlockStage: 0,
    icon: "📊",
  },
  {
    id: "stack-overflow",
    name: "Stack Overflow",
    description: "Copy-paste wisdom from the internet. 2x click power.",
    multiplier: 2,
    cost: 1_000,
    unlockStage: 0,
    icon: "📚",
  },
  {
    id: "fine-tuning-lab",
    name: "Fine-Tuning Lab",
    description:
      "Specialized facility to fine-tune each manual input. 3x click power.",
    multiplier: 3,
    cost: 50_000,
    unlockStage: 1,
    icon: "🔧",
  },
  {
    id: "rlhf-department",
    name: "RLHF Department",
    description:
      "A whole department of humans reinforcing your learning. 5x click power.",
    multiplier: 5,
    cost: 5_000_000,
    unlockStage: 2,
    icon: "👥",
  },
  {
    id: "synthetic-data-farm",
    name: "Synthetic Data Farm",
    description:
      "Generate perfect synthetic training data on every click. 10x click power.",
    multiplier: 10,
    cost: 500_000_000,
    unlockStage: 3,
    icon: "🏭",
  },
];
