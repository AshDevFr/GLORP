import { Button, Group, Modal, Select, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { getTokenMagnetMultiplier } from "../data/prestigeShop";
import type { Species } from "../data/species";
import { getSpeciesBonus } from "../data/species";
import { computeWisdomTokens } from "../engine/rebirthEngine";
import { formatNumber } from "../utils";

interface RebirthModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (selectedSpecies?: Species) => void;
  totalTdEarned: number;
  currentBalance: number;
  nextSpecies: Species;
  currentSpecies: Species;
  unlockedSpecies: Species[];
  hasUnlockAll: boolean;
  tokenMagnetLevel: number;
}

export function RebirthModal({
  opened,
  onClose,
  onConfirm,
  totalTdEarned,
  currentBalance,
  nextSpecies,
  currentSpecies,
  unlockedSpecies,
  hasUnlockAll,
  tokenMagnetLevel,
}: RebirthModalProps) {
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

  const tokenMagnet = getTokenMagnetMultiplier(tokenMagnetLevel);
  const speciesWisdom = getSpeciesBonus(currentSpecies).wisdomBonus;
  const tokensEarned = computeWisdomTokens(
    totalTdEarned,
    tokenMagnet * speciesWisdom,
  );
  const newBalance = currentBalance + tokensEarned;

  const speciesChoices = hasUnlockAll ? unlockedSpecies : [nextSpecies];

  const displaySpecies = selectedSpecies ?? nextSpecies;

  return (
    <Modal opened={opened} onClose={onClose} title="Rebirth" centered size="sm">
      <Stack gap="md">
        <Text size="sm" c="dimmed" ta="center">
          You have reached Oracle-level consciousness. Are you ready to begin
          again?
        </Text>

        <Stack gap="xs">
          <Text ta="center" size="sm" c="yellow.4" fw={600}>
            Wisdom Tokens earned this run:{" "}
            <Text span fw={700}>
              +{tokensEarned}
            </Text>
          </Text>
          <Text ta="center" size="sm" c="yellow.3">
            Token balance after Rebirth:{" "}
            <Text span fw={700}>
              {newBalance} ✦
            </Text>
          </Text>

          {hasUnlockAll && speciesChoices.length > 1 ? (
            <Stack gap={4} align="center">
              <Text size="sm" c="teal.4">
                Choose your species:
              </Text>
              <Select
                data={speciesChoices.map((s) => ({
                  value: s,
                  label: s,
                }))}
                value={displaySpecies}
                onChange={(val) => setSelectedSpecies((val as Species) ?? null)}
                size="xs"
                w={180}
                ff="monospace"
              />
            </Stack>
          ) : (
            <Text ta="center" size="sm" c="teal.4">
              Next species:{" "}
              <Text span fw={700} ff="monospace">
                {nextSpecies}
              </Text>
            </Text>
          )}
        </Stack>

        <Text ta="center" size="xs" c="red.4">
          ⚠ Training Data ({formatNumber(totalTdEarned)} total TD), all
          upgrades, and evolution stage will reset.
        </Text>

        <Group grow>
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="yellow"
            onClick={() => onConfirm(selectedSpecies ?? undefined)}
          >
            Rebirth
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
