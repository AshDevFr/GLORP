import { Modal, ScrollArea, Stack, Text } from "@mantine/core";
import { ACHIEVEMENTS } from "../data/achievements";
import { useGameStore } from "../store";

export function AchievementsModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const unlockedSet = new Set(unlockedAchievements);
  const unlockedCount = unlockedAchievements.length;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text ff="monospace" fw={700}>
          Achievements ({unlockedCount}/{ACHIEVEMENTS.length})
        </Text>
      }
      size="md"
    >
      <ScrollArea mah={480}>
        <Stack gap="xs">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlockedSet.has(a.id);
            return (
              <Stack
                key={a.id}
                gap={2}
                p="xs"
                style={{
                  borderRadius: 4,
                  background: isUnlocked
                    ? "rgba(255,215,0,0.07)"
                    : "rgba(255,255,255,0.03)",
                  borderLeft: isUnlocked
                    ? "3px solid var(--mantine-color-yellow-5)"
                    : "3px solid var(--mantine-color-dark-4)",
                }}
              >
                <Text
                  size="sm"
                  ff="monospace"
                  fw={700}
                  c={isUnlocked ? "yellow" : "dimmed"}
                >
                  {isUnlocked ? "★" : "☆"} {a.name}
                </Text>
                <Text size="xs" c="dimmed" ff="monospace">
                  {a.description}
                </Text>
              </Stack>
            );
          })}
        </Stack>
      </ScrollArea>
    </Modal>
  );
}
