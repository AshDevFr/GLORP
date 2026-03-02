import {
  Button,
  Divider,
  Drawer,
  FileButton,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { useSettingsStore } from "../store/settingsStore";
import {
  applySave,
  exportSave,
  parseSaveFile,
  resetGame,
} from "../utils/saveManager";

export function SettingsPanel({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const crtEnabled = useSettingsStore((s) => s.crtEnabled);
  const animationsDisabled = useSettingsStore((s) => s.animationsDisabled);
  const setCrtEnabled = useSettingsStore((s) => s.setCrtEnabled);
  const setAnimationsDisabled = useSettingsStore(
    (s) => s.setAnimationsDisabled,
  );

  const [resetStage, setResetStage] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleImport(file: File | null) {
    if (!file) return;
    setImportError(null);
    try {
      const save = await parseSaveFile(file);
      applySave(save);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Failed to import save");
    }
  }

  function handleReset() {
    if (resetStage === 0) {
      setResetStage(1);
    } else {
      resetGame();
      setResetStage(0);
      onClose();
    }
  }

  function handleClose() {
    setResetStage(0);
    setImportError(null);
    onClose();
  }

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title={
        <Text ff="monospace" fw={700}>
          ⚙ Settings
        </Text>
      }
      position="right"
    >
      <Stack gap="md">
        <Switch
          label="CRT Scanlines"
          description="Apply a retro CRT scanline overlay"
          checked={crtEnabled}
          onChange={(e) => setCrtEnabled(e.currentTarget.checked)}
          styles={{ label: { fontFamily: "monospace" } }}
        />
        <Switch
          label="Disable Animations"
          description="Turn off all animations and particle effects"
          checked={animationsDisabled}
          onChange={(e) => setAnimationsDisabled(e.currentTarget.checked)}
          styles={{ label: { fontFamily: "monospace" } }}
        />

        <Divider />

        <Button
          variant="default"
          onClick={exportSave}
          style={{ fontFamily: "monospace" }}
        >
          Export Save
        </Button>

        <FileButton accept="application/json" onChange={handleImport}>
          {(props) => (
            <Button
              {...props}
              variant="default"
              style={{ fontFamily: "monospace" }}
            >
              Import Save
            </Button>
          )}
        </FileButton>

        {importError && (
          <Text c="red" size="xs" ff="monospace">
            {importError}
          </Text>
        )}

        <Divider />

        <Button
          color={resetStage === 1 ? "red" : "gray"}
          variant={resetStage === 1 ? "filled" : "default"}
          onClick={handleReset}
          style={{ fontFamily: "monospace" }}
        >
          {resetStage === 1 ? "⚠ Confirm Reset" : "Reset Game"}
        </Button>

        {resetStage === 1 && (
          <Text size="xs" c="dimmed" ff="monospace">
            All progress will be lost. Click again to confirm.
          </Text>
        )}
      </Stack>
    </Drawer>
  );
}
