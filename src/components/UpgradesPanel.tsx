import { Stack, Text, Title } from "@mantine/core";

export function UpgradesPanel() {
  return (
    <Stack
      gap="sm"
      p="md"
      style={{
        borderLeft: "1px solid var(--mantine-color-dark-4)",
        height: "100%",
      }}
    >
      <Title order={4} ff="monospace" c="green">
        Upgrades
      </Title>
      <Text size="sm" c="dimmed" ff="monospace">
        No upgrades available yet.
      </Text>
    </Stack>
  );
}
