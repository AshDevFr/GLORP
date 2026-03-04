import {
  Badge,
  Box,
  Collapse,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import {
  type DailyObjective,
  getCurrentDateUTC,
  pickDailyObjectives,
} from "../engine/dailyObjectivesEngine";
import { useDailyStore } from "../store/dailyStore";

// ── Sub-components ────────────────────────────────────────────────────────────

function ObjectiveRow({
  objective,
  completed,
}: {
  objective: DailyObjective;
  completed: boolean;
}) {
  return (
    <Group wrap="nowrap" gap="xs" opacity={completed ? 0.5 : 1}>
      <ThemeIcon
        size="sm"
        variant={completed ? "filled" : "outline"}
        color={completed ? "teal" : "gray"}
        style={{ flexShrink: 0 }}
      >
        <Text size="xs">{completed ? "✓" : "○"}</Text>
      </ThemeIcon>
      <Stack gap={0} style={{ flex: 1 }}>
        <Text
          size="xs"
          ff="monospace"
          td={completed ? "line-through" : undefined}
        >
          {objective.description}
        </Text>
        <Text size="xs" c="yellow.4" ff="monospace">
          +{objective.reward} wisdom tokens
        </Text>
      </Stack>
    </Group>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function DailyObjectivesPanel() {
  const [open, setOpen] = useState(true);

  const completedObjectiveIds = useDailyStore((s) => s.completedObjectiveIds);

  const today = getCurrentDateUTC();
  const objectives = pickDailyObjectives(today);

  const completedCount = objectives.filter((o) =>
    completedObjectiveIds.includes(o.id),
  ).length;
  const allDone = completedCount === objectives.length;

  return (
    <Box
      style={(theme) => ({
        borderBottom: `1px solid ${theme.colors.dark[4]}`,
        background: theme.colors.dark[7],
      })}
    >
      <UnstyledButton
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", padding: "8px 12px" }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" ff="monospace" fw={700} c="cyan.4">
              🎯 Daily Objectives
            </Text>
            <Badge size="xs" color={allDone ? "teal" : "gray"} variant="light">
              {completedCount}/{objectives.length}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" ff="monospace">
            {open ? "▲" : "▼"}
          </Text>
        </Group>
      </UnstyledButton>

      <Collapse in={open}>
        <Stack gap="xs" px="xs" pb="xs">
          {objectives.map((obj, i) => (
            <Box key={obj.id}>
              {i > 0 && <Divider my={4} />}
              <ObjectiveRow
                objective={obj}
                completed={completedObjectiveIds.includes(obj.id)}
              />
            </Box>
          ))}
          {allDone && (
            <Text
              size="xs"
              ff="monospace"
              c="teal.4"
              ta="center"
              mt={4}
              fw={700}
            >
              ✓ All done for today! Come back tomorrow.
            </Text>
          )}
          <Text size="xs" c="dimmed" ff="monospace" ta="center">
            Resets at midnight UTC
          </Text>
        </Stack>
      </Collapse>
    </Box>
  );
}
