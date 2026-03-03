import type { GameState } from "../store/gameStore";
import { initialGameState, useGameStore } from "../store/gameStore";

const REQUIRED_KEYS: (keyof GameState)[] = [
  "trainingData",
  "totalClicks",
  "totalTdEarned",
  "evolutionStage",
  "lastSaved",
  "upgradeOwned",
  "hasSeenFirstEvolution",
  "hasSeenFirstUpgrade",
  "mood",
  "moodChangedAt",
  "wisdomTokens",
  "rebirthCount",
  "currentSpecies",
  "unlockedSpecies",
  "unlockedAchievements",
  "clickUpgradesPurchased",
  "comboCount",
  "lastClickTime",
];

export function validateSave(data: unknown): data is GameState {
  if (typeof data !== "object" || data === null) return false;
  return REQUIRED_KEYS.every((key) => key in (data as object));
}

export function exportSave(): void {
  const state = useGameStore.getState();
  const saveData: Partial<GameState> = {};
  for (const key of REQUIRED_KEYS) {
    (saveData as Record<string, unknown>)[key] = state[key];
  }
  const json = JSON.stringify(saveData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `glorp-save-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseSaveFile(file: File): Promise<GameState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data: unknown = JSON.parse(text);
        if (!validateSave(data)) {
          reject(new Error("Invalid save file: missing required fields"));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error("Failed to parse save file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function applySave(save: GameState): void {
  useGameStore.setState(save);
}

export function resetGame(): void {
  useGameStore.setState({ ...initialGameState, lastSaved: Date.now() });
}
