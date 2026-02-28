import { Text } from "@mantine/core";

interface SpeechBubbleProps {
  text: string;
}

export function SpeechBubble({ text }: SpeechBubbleProps) {
  return (
    <Text
      size="sm"
      ff="monospace"
      c="green.3"
      ta="center"
      px="md"
      py="xs"
      style={{
        border: "1px solid var(--mantine-color-green-8)",
        borderRadius: "var(--mantine-radius-md)",
        maxWidth: 300,
      }}
    >
      &ldquo;{text}&rdquo;
    </Text>
  );
}
