import { STAGES } from "../data/stages";

export function getEvolutionStage(totalTdEarned: number): number {
  let stage = 0;
  for (const s of STAGES) {
    if (totalTdEarned >= s.unlockAt) {
      stage = s.stage;
    }
  }
  return stage;
}
