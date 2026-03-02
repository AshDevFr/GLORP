import { Divider, Modal, Stack, Text } from "@mantine/core";
import { ACHIEVEMENTS } from "../data/achievements";
import { useGameStore } from "../store";
import { formatNumber } from "../utils/formatNumber";

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

interface StatRowProps {
  label: string;
  value: string;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" ff="monospace">
        {label}
      </Text>
      <Text size="sm" ff="monospace" fw={700}>
        {value}
      </Text>
    </Stack>
  );
}

export function StatsPanel({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const totalTdEarned = useGameStore((s) => s.totalTdEarned);
  const totalClicks = useGameStore((s) => s.totalClicks);
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const totalTimePlayed = useGameStore((s) => s.totalTimePlayed);
  const rebirthCount = useGameStore((s) => s.rebirthCount);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const easterEggsUnlocked = useGameStore((s) => s.easterEggsUnlocked);

  const totalUpgradesPurchased = Object.values(upgradeOwned).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text ff="monospace" fw={700}>
          📊 Lifetime Stats
        </Text>
      }
      size="sm"
    >
      <Stack gap="md">
        <StatRow
          label="Total TD Earned (this run)"
          value={formatNumber(totalTdEarned)}
        />
        <StatRow
          label="Total Clicks (this run)"
          value={totalClicks.toLocaleString()}
        />
        <StatRow
          label="Total Upgrades Purchased (this run)"
          value={totalUpgradesPurchased.toLocaleString()}
        />

        <Divider />

        <StatRow
          label="Total Time Played"
          value={formatTime(Math.floor(totalTimePlayed))}
        />
        <StatRow label="Rebirths" value={rebirthCount.toLocaleString()} />
        <StatRow
          label="Achievements Unlocked"
          value={`${unlockedAchievements.length} / ${ACHIEVEMENTS.length}`}
        />

        <Divider />

        <StatRow
          label="Easter Eggs Found"
          value={`${easterEggsUnlocked.length} / 3`}
        />
      </Stack>
    </Modal>
  );
}
