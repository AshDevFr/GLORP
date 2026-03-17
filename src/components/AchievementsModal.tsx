import {
  Badge,
  Drawer,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
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
  const totalCount = ACHIEVEMENTS.length;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="sm"
      title={
        <Group gap="sm" align="center">
          <Title order={4} ff="monospace" c="yellow">
            Achievements
          </Title>
          <Badge color="yellow" variant="light" size="lg" ff="monospace">
            {unlockedCount} / {totalCount} Unlocked
          </Badge>
        </Group>
      }
    >
      <ScrollArea h="calc(100vh - 80px)">
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
                  opacity: isUnlocked ? 1 : 0.5,
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
    </Drawer>
  );
}
