// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState } from "../store/gameStore";
import { initialGameState, useGameStore } from "../store/gameStore";
import {
  applySave,
  exportSave,
  migrateSave,
  parseSaveFile,
  resetGame,
  validateSave,
} from "./saveManager";

const validSave: GameState = {
  trainingData: 100,
  totalClicks: 50,
  totalTdEarned: 200,
  evolutionStage: 1,
  lastSaved: 1000,
  upgradeOwned: { "neural-notepad": 2 },
  hasSeenFirstEvolution: true,
  hasSeenFirstUpgrade: true,
  mood: "Happy",
  moodChangedAt: 500,
  wisdomTokens: 3,
  rebirthCount: 1,
  currentSpecies: "GLORP",
  unlockedSpecies: ["GLORP"],
  unlockedAchievements: ["first-click"],
  easterEggsUnlocked: [],
  totalTimePlayed: 0,
  clickUpgradesPurchased: [],
  boostersPurchased: [],
  comboCount: 0,
  lastClickTime: 0,
  crossedMilestones: [],
  prestigeUpgrades: {},
  prestigeTokenBalance: 0,
  hasOpenedPrestigeShop: false,
};

beforeEach(() => {
  useGameStore.setState(initialGameState);
  vi.restoreAllMocks();
});

describe("validateSave", () => {
  it("returns true for a valid save object", () => {
    expect(validateSave(validSave)).toBe(true);
  });

  it("returns false for null", () => {
    expect(validateSave(null)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(validateSave("not an object")).toBe(false);
  });

  it("returns false when a required key is missing", () => {
    const { trainingData: _td, ...missing } = validSave;
    expect(validateSave(missing)).toBe(false);
  });

  it("returns false for an empty object", () => {
    expect(validateSave({})).toBe(false);
  });

  it("returns false for an array", () => {
    expect(validateSave([])).toBe(false);
  });
});

describe("applySave", () => {
  it("applies the save to the game store", () => {
    applySave(validSave);
    const state = useGameStore.getState();
    expect(state.trainingData).toBe(100);
    expect(state.totalClicks).toBe(50);
    expect(state.rebirthCount).toBe(1);
    expect(state.unlockedAchievements).toEqual(["first-click"]);
  });

  it("overwrites existing store values", () => {
    useGameStore.setState({ trainingData: 9999 });
    applySave(validSave);
    expect(useGameStore.getState().trainingData).toBe(100);
  });
});

describe("resetGame", () => {
  it("resets trainingData to 0", () => {
    useGameStore.setState({ trainingData: 9999 });
    resetGame();
    expect(useGameStore.getState().trainingData).toBe(0);
  });

  it("resets totalClicks to 0", () => {
    useGameStore.setState({ totalClicks: 500 });
    resetGame();
    expect(useGameStore.getState().totalClicks).toBe(0);
  });

  it("resets wisdomTokens to 0", () => {
    useGameStore.setState({ wisdomTokens: 10 });
    resetGame();
    expect(useGameStore.getState().wisdomTokens).toBe(0);
  });

  it("resets rebirthCount to 0", () => {
    useGameStore.setState({ rebirthCount: 5 });
    resetGame();
    expect(useGameStore.getState().rebirthCount).toBe(0);
  });
});

describe("exportSave", () => {
  it("triggers a file download", () => {
    const mockUrl = "blob:mock-url";
    URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
    URL.revokeObjectURL = vi.fn();
    const mockClick = vi.fn();
    const mockA = {
      href: "",
      download: "",
      click: mockClick,
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(mockA);

    exportSave();

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });

  it("uses a .json download filename", () => {
    URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
    URL.revokeObjectURL = vi.fn();
    let capturedDownload = "";
    const mockA = {
      href: "",
      get download() {
        return capturedDownload;
      },
      set download(v: string) {
        capturedDownload = v;
      },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(mockA);

    exportSave();

    expect(capturedDownload).toMatch(/glorp-save-\d+\.json/);
  });
});

describe("migrateSave", () => {
  it("converts wisdomTokens to prestigeTokenBalance for old saves", () => {
    const oldSave = { ...validSave, wisdomTokens: 10 } as GameState;
    // Remove prestige fields to simulate an old save
    const record = oldSave as unknown as Record<string, unknown>;
    delete record.prestigeTokenBalance;
    delete record.prestigeUpgrades;

    const migrated = migrateSave(oldSave);
    expect(migrated.prestigeTokenBalance).toBe(10);
    expect(migrated.prestigeUpgrades).toEqual({});
  });

  it("preserves existing prestige fields for new saves", () => {
    const newSave: GameState = {
      ...validSave,
      prestigeUpgrades: { "quick-start": 2 },
      prestigeTokenBalance: 5,
    };
    const migrated = migrateSave(newSave);
    expect(migrated.prestigeTokenBalance).toBe(5);
    expect(migrated.prestigeUpgrades).toEqual({ "quick-start": 2 });
  });

  it("defaults prestigeTokenBalance to 0 when wisdomTokens is also 0", () => {
    const oldSave = { ...validSave, wisdomTokens: 0 } as GameState;
    const record = oldSave as unknown as Record<string, unknown>;
    delete record.prestigeTokenBalance;
    delete record.prestigeUpgrades;

    const migrated = migrateSave(oldSave);
    expect(migrated.prestigeTokenBalance).toBe(0);
    expect(migrated.prestigeUpgrades).toEqual({});
  });
});

describe("parseSaveFile", () => {
  it("resolves with parsed GameState for a valid JSON file", async () => {
    const json = JSON.stringify(validSave);
    const file = new File([json], "save.json", { type: "application/json" });
    const result = await parseSaveFile(file);
    expect(result.trainingData).toBe(100);
    expect(result.rebirthCount).toBe(1);
  });

  it("rejects when the file has invalid JSON", async () => {
    const file = new File(["not json"], "save.json", {
      type: "application/json",
    });
    await expect(parseSaveFile(file)).rejects.toThrow();
  });

  it("rejects when the JSON is missing required fields", async () => {
    const file = new File([JSON.stringify({ foo: "bar" })], "save.json", {
      type: "application/json",
    });
    await expect(parseSaveFile(file)).rejects.toThrow("Invalid save file");
  });
});
