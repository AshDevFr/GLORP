import { Container, Text, Title } from "@mantine/core";

export function App() {
  return (
    <Container size="sm" py="xl">
      <Title order={1}>GLORP</Title>
      <Text c="dimmed" mt="sm">
        Generalized Learning Organism for Recursive Processing
      </Text>
    </Container>
  );
}
