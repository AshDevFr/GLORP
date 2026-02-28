export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseTdPerSecond: number;
  tier: "garage-lab" | "startup";
  icon: string;
}

export const UPGRADES: readonly Upgrade[] = [
  {
    id: "neural-notepad",
    name: "Neural Notepad",
    description: "A simple notepad that jots down patterns while you sleep.",
    baseCost: 10,
    baseTdPerSecond: 0.1,
    tier: "garage-lab",
    icon: "📝",
  },
  {
    id: "data-hamster-wheel",
    name: "Data Hamster Wheel",
    description: "A tiny hamster processes data one byte at a time.",
    baseCost: 50,
    baseTdPerSecond: 0.5,
    tier: "garage-lab",
    icon: "🐹",
  },
  {
    id: "pattern-antenna",
    name: "Pattern Antenna",
    description: "Picks up stray patterns from the airwaves.",
    baseCost: 250,
    baseTdPerSecond: 2,
    tier: "garage-lab",
    icon: "📡",
  },
  {
    id: "intern-algorithm",
    name: "Intern Algorithm",
    description: "An unpaid algorithm that sorts data surprisingly well.",
    baseCost: 1_000,
    baseTdPerSecond: 5,
    tier: "startup",
    icon: "🧑‍💻",
  },
  {
    id: "cloud-crumb",
    name: "Cloud Crumb",
    description:
      "A tiny slice of cloud compute, barely enough for a breadcrumb.",
    baseCost: 5_000,
    baseTdPerSecond: 20,
    tier: "startup",
    icon: "☁️",
  },
  {
    id: "gpu-toaster",
    name: "GPU Toaster",
    description: "Repurposed toaster with a graphics card duct-taped inside.",
    baseCost: 25_000,
    baseTdPerSecond: 100,
    tier: "startup",
    icon: "🍞",
  },
];
