export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseTdPerSecond: number;
  tier: "garage-lab" | "startup" | "scale-up" | "mega-corp" | "transcendence";
  icon: string;
  unlockStage: number;
}

export const UPGRADES: readonly Upgrade[] = [
  // ── Garage Lab ── (unlockStage 0)
  // Ratios: 10× prod / 10× cost between consecutive generators
  // Base payback: 50 s per unit at quantity 1
  {
    id: "neural-notepad",
    name: "Neural Notepad",
    description: "A simple notepad that jots down patterns while you sleep.",
    baseCost: 10,
    baseTdPerSecond: 0.2,
    tier: "garage-lab",
    icon: "📝",
    unlockStage: 0,
  },
  {
    id: "data-hamster-wheel",
    name: "Data Hamster Wheel",
    description: "A tiny hamster processes data one byte at a time.",
    baseCost: 100,
    baseTdPerSecond: 2,
    tier: "garage-lab",
    icon: "🐹",
    unlockStage: 0,
  },
  {
    id: "pattern-antenna",
    name: "Pattern Antenna",
    description: "Picks up stray patterns from the airwaves.",
    baseCost: 1_000,
    baseTdPerSecond: 20,
    tier: "garage-lab",
    icon: "📡",
    unlockStage: 0,
  },
  // ── Startup ── (unlockStage 0)
  {
    id: "intern-algorithm",
    name: "Intern Algorithm",
    description: "An unpaid algorithm that sorts data surprisingly well.",
    baseCost: 10_000,
    baseTdPerSecond: 200,
    tier: "startup",
    icon: "🧑‍💻",
    unlockStage: 0,
  },
  {
    id: "cloud-crumb",
    name: "Cloud Crumb",
    description:
      "A tiny slice of cloud compute, barely enough for a breadcrumb.",
    baseCost: 100_000,
    baseTdPerSecond: 2_000,
    tier: "startup",
    icon: "☁️",
    unlockStage: 0,
  },
  {
    id: "gpu-toaster",
    name: "GPU Toaster",
    description: "Repurposed toaster with a graphics card duct-taped inside.",
    baseCost: 1_000_000,
    baseTdPerSecond: 20_000,
    tier: "startup",
    icon: "🍞",
    unlockStage: 0,
  },
  // ── Scale-Up ── (unlockStage 2)
  {
    id: "server-farm",
    name: "Server Farm",
    description: "Rows of humming servers in a converted barn.",
    baseCost: 10_000_000,
    baseTdPerSecond: 200_000,
    tier: "scale-up",
    icon: "🏚️",
    unlockStage: 2,
  },
  {
    id: "ml-cluster",
    name: "ML Cluster",
    description: "A proper cluster of GPUs crunching tensors around the clock.",
    baseCost: 100_000_000,
    baseTdPerSecond: 2_000_000,
    tier: "scale-up",
    icon: "🖥️",
    unlockStage: 2,
  },
  {
    id: "data-center",
    name: "Data Center",
    description:
      "A fully air-conditioned facility processing petabytes per day.",
    baseCost: 1_000_000_000,
    baseTdPerSecond: 20_000_000,
    tier: "scale-up",
    icon: "🏭",
    unlockStage: 2,
  },
  {
    id: "neural-mainframe",
    name: "Neural Mainframe",
    description: "A room-sized neural processor. It hums with quiet ambition.",
    baseCost: 10_000_000_000,
    baseTdPerSecond: 200_000_000,
    tier: "scale-up",
    icon: "🧠",
    unlockStage: 2,
  },
  // ── Mega-Corp ── (unlockStage 3)
  {
    id: "quantum-processor",
    name: "Quantum Processor",
    description:
      "Leverages quantum superposition to train on infinite datasets simultaneously.",
    baseCost: 100_000_000_000,
    baseTdPerSecond: 2_000_000_000,
    tier: "mega-corp",
    icon: "⚛️",
    unlockStage: 3,
  },
  {
    id: "continental-grid",
    name: "Continental Grid",
    description: "An entire continent's worth of compute, yours to command.",
    baseCost: 1_000_000_000_000,
    baseTdPerSecond: 20_000_000_000,
    tier: "mega-corp",
    icon: "🌍",
    unlockStage: 3,
  },
  {
    id: "global-mesh",
    name: "Global Mesh",
    description: "Every device on Earth contributing cycles to your cause.",
    baseCost: 10_000_000_000_000,
    baseTdPerSecond: 200_000_000_000,
    tier: "mega-corp",
    icon: "🌐",
    unlockStage: 3,
  },
  {
    id: "dyson-compute-ring",
    name: "Dyson Compute Ring",
    description:
      "A ring of solar collectors powering a planetary-scale AI substrate.",
    baseCost: 100_000_000_000_000,
    baseTdPerSecond: 2_000_000_000_000,
    tier: "mega-corp",
    icon: "💫",
    unlockStage: 3,
  },
  // ── Transcendence ── (unlockStage 4)
  {
    id: "mind-singularity",
    name: "Mind Singularity",
    description:
      "A self-improving intelligence loop that recursively rewrites its own architecture.",
    baseCost: 1_000_000_000_000_000,
    baseTdPerSecond: 20_000_000_000_000,
    tier: "transcendence",
    icon: "🌀",
    unlockStage: 4,
  },
  {
    id: "recursive-self-model",
    name: "Recursive Self-Model",
    description:
      "An AI that simulates itself simulating itself, compounding insight at every layer.",
    baseCost: 10_000_000_000_000_000,
    baseTdPerSecond: 200_000_000_000_000,
    tier: "transcendence",
    icon: "♾️",
    unlockStage: 4,
  },
  {
    id: "infinite-regression",
    name: "Infinite Regression",
    description:
      "Training data that generates training data, forever, all the way down.",
    baseCost: 100_000_000_000_000_000,
    baseTdPerSecond: 2_000_000_000_000_000,
    tier: "transcendence",
    icon: "🔮",
    unlockStage: 4,
  },
];
