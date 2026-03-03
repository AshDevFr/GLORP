import { Badge, Divider, Group, Modal, Stack, Text } from "@mantine/core";
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

function formatRunDuration(runStart: number): string {
  if (runStart === 0) return "—";
  const ms = Date.now() - runStart;
  return formatTime(Math.floor(ms / 1000));
}

interface StatRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatRow({ label, value, highlight }: StatRowProps) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="xs" c="dimmed" ff="monospace">
        {label}
      </Text>
      <Text
        size="xs"
        ff="monospace"
        fw={700}
        c={highlight ? "yellow.4" : undefined}
      >
        {value}
        {highlight && " ★"}
      </Text>
    </Group>
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
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const peakTdPerSecond = useGameStore((s) => s.peakTdPerSecond);
  const peakGeneratorsOwned = useGameStore((s) => s.peakGeneratorsOwned);
  const runStart = useGameStore((s) => s.runStart);

  const totalTimePlayed = useGameStore((s) => s.totalTimePlayed);
  const rebirthCount = useGameStore((s) => s.rebirthCount);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const easterEggsUnlocked = useGameStore((s) => s.easterEggsUnlocked);
  const lifetimeTdEarned = useGameStore((s) => s.lifetimeTdEarned);
  const lifetimePeakTdPerSecond = useGameStore(
    (s) => s.lifetimePeakTdPerSecond,
  );
  const lifetimeBestRunTd = useGameStore((s) => s.lifetimeBestRunTd);
  const lifetimeWisdomEarned = useGameStore((s) => s.lifetimeWisdomEarned);

  const totalUpgradesPurchased = Object.values(upgradeOwned).reduce(
    (sum, count) => sum + count,
    0,
  );

  const isBestRun = rebirthCount > 0 && totalTdEarned > lifetimeBestRunTd;
  const isPeakTdPs =
    rebirthCount > 0 && peakTdPerSecond > lifetimePeakTdPerSecond;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text ff="monospace" fw={700}>
          📊 Stats
        </Text>
      }
      size="sm"
    >
      <Stack gap="md">
        <Stack gap={2}>
          <Group gap="xs">
            <Text size="xs" ff="monospace" fw={700} c="teal.4">
              This Run
            </Text>
            {isBestRun && (
              <Badge size="xs" color="yellow" variant="light">
                Best run!
              </Badge>
            )}
          </Group>
          <StatRow label="Run duration" value={formatRunDuration(runStart)} />
          <StatRow
            label="TD earned"
            value={formatNumber(totalTdEarned)}
            highlight={isBestRun}
          />
          <StatRow label="Clicks" value={totalClicks.toLocaleString()} />
          <StatRow
            label="Generators owned"
            value={totalUpgradesPurchased.toLocaleString()}
          />
          <StatRow
            label="Peak TD/s"
            value={`${formatNumber(peakTdPerSecond)}/s`}
            highlight={isPeakTdPs}
          />
          <StatRow
            label="Peak generators"
            value={peakGeneratorsOwned.toLocaleString()}
          />
          <StatRow label="Evolution stage" value={evolutionStage.toString()} />
        </Stack>

        <Divider label="Lifetime" labelPosition="center" />

        <Stack gap={2}>
          <StatRow
            label="Total TD (all runs)"
            value={formatNumber(lifetimeTdEarned + totalTdEarned)}
          />
          <StatRow label="Rebirths" value={rebirthCount.toLocaleString()} />
          <StatRow
            label="Time played"
            value={formatTime(Math.floor(totalTimePlayed))}
          />
          <StatRow
            label="Best run TD"
            value={formatNumber(Math.max(lifetimeBestRunTd, totalTdEarned))}
          />
          <StatRow
            label="All-time peak TD/s"
            value={`${formatNumber(Math.max(lifetimePeakTdPerSecond, peakTdPerSecond))}/s`}
          />
          <StatRow
            label="Wisdom earned (total)"
            value={lifetimeWisdomEarned.toLocaleString()}
          />
        </Stack>

        <Divider />

        <Stack gap={2}>
          <StatRow
            label="Achievements"
            value={`${unlockedAchievements.length} / ${ACHIEVEMENTS.length}`}
          />
          <StatRow
            label="Easter eggs found"
            value={`${easterEggsUnlocked.length} / 3`}
          />
        </Stack>
      </Stack>
    </Modal>
  );
}
