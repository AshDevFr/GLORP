import { Button, Modal, Stack, Text } from "@mantine/core";
import type { OfflineProgressResult } from "../engine/offlineEngine";
import { formatNumber } from "../utils";

interface OfflineProgressModalProps {
  result: OfflineProgressResult | null;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 3_600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  return `${hours}h ${minutes}m`;
}

export function OfflineProgressModal({
  result,
  onClose,
}: OfflineProgressModalProps) {
  const wasCapped =
    result !== null && result.elapsedSeconds > result.cappedSeconds;

  return (
    <Modal
      opened={result !== null}
      onClose={onClose}
      title="Welcome back!"
      centered
      size="sm"
    >
      {result && (
        <Stack gap="md">
          <Text size="md" ff="monospace" c="green.3" ta="center">
            &ldquo;{result.welcomeMessage}&rdquo;
          </Text>

          <Stack gap="xs">
            <Text ta="center" c="dimmed" size="sm">
              You were away for{" "}
              <Text span fw={700} c="white">
                {formatDuration(result.elapsedSeconds)}
              </Text>
              {wasCapped && (
                <Text span c="dimmed">
                  {" "}
                  (capped at 8h)
                </Text>
              )}
            </Text>

            <Text ta="center" size="lg">
              +{formatNumber(result.earned)}{" "}
              <Text span c="blue.4">
                TD
              </Text>{" "}
              earned at 50% efficiency
            </Text>
          </Stack>

          <Button onClick={onClose} variant="light" color="green" fullWidth>
            Continue
          </Button>
        </Stack>
      )}
    </Modal>
  );
}
