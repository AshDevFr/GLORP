import {
  Button,
  Divider,
  Drawer,
  FileButton,
  Modal,
  Stack,
  Switch,
  Text,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useSettingsStore } from "../store/settingsStore";
import {
  applySave,
  exportSave,
  exportSaveToClipboard,
  importSaveFromString,
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
  const numberFormat = useSettingsStore((s) => s.numberFormat);
  const setCrtEnabled = useSettingsStore((s) => s.setCrtEnabled);
  const setAnimationsDisabled = useSettingsStore(
    (s) => s.setAnimationsDisabled,
  );
  const setNumberFormat = useSettingsStore((s) => s.setNumberFormat);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);

  const [resetStage, setResetStage] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);

  async function handleCopyToClipboard() {
    try {
      await exportSaveToClipboard();
      notifications.show({
        title: "Save exported!",
        message: "Save string copied to clipboard.",
        color: "green",
        autoClose: 4000,
      });
    } catch {
      notifications.show({
        title: "Export failed",
        message: "Could not copy to clipboard.",
        color: "red",
        autoClose: 4000,
      });
    }
  }

  function handleOpenImportModal() {
    setImportText("");
    setPasteError(null);
    setImportModalOpen(true);
  }

  function handleConfirmImport() {
    setPasteError(null);
    try {
      const save = importSaveFromString(importText.trim());
      applySave(save);
      setImportModalOpen(false);
      setImportText("");
      notifications.show({
        title: "Save imported!",
        message: "Your game state has been restored.",
        color: "green",
        autoClose: 4000,
      });
    } catch (e) {
      setPasteError(
        e instanceof Error ? e.message : "Failed to import save string",
      );
    }
  }

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
    <>
      <Modal
        opened={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title={
          <Text ff="monospace" fw={700}>
            Import Save
          </Text>
        }
        centered
      >
        <Stack gap="sm">
          <Text size="xs" ff="monospace" c="dimmed">
            Paste your save string below and click Confirm to load it.
          </Text>
          <Textarea
            placeholder="Paste save string here..."
            value={importText}
            onChange={(e) => setImportText(e.currentTarget.value)}
            minRows={4}
            styles={{ input: { fontFamily: "monospace", fontSize: 11 } }}
            autoFocus
          />
          {pasteError && (
            <Text c="red" size="xs" ff="monospace">
              {pasteError}
            </Text>
          )}
          <Button
            onClick={handleConfirmImport}
            disabled={importText.trim().length === 0}
            style={{ fontFamily: "monospace" }}
          >
            Confirm Import
          </Button>
        </Stack>
      </Modal>

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
          <Switch
            label="Full Number Display"
            description="Show full numbers (1,234,567) instead of compact (1.23M)"
            checked={numberFormat === "full"}
            onChange={(e) =>
              setNumberFormat(e.currentTarget.checked ? "full" : "compact")
            }
            styles={{ label: { fontFamily: "monospace" } }}
          />
          <Switch
            label="Sound Effects"
            description="Play synthesised audio feedback for clicks, purchases and events"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.currentTarget.checked)}
            styles={{ label: { fontFamily: "monospace" } }}
          />

          <Divider />

          <Button
            variant="default"
            onClick={exportSave}
            style={{ fontFamily: "monospace" }}
          >
            Export Save (JSON file)
          </Button>

          <FileButton accept="application/json" onChange={handleImport}>
            {(props) => (
              <Button
                {...props}
                variant="default"
                style={{ fontFamily: "monospace" }}
              >
                Import Save (JSON file)
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
            variant="default"
            onClick={handleCopyToClipboard}
            style={{ fontFamily: "monospace" }}
          >
            Copy Save to Clipboard
          </Button>

          <Button
            variant="default"
            onClick={handleOpenImportModal}
            style={{ fontFamily: "monospace" }}
          >
            Import Save from Text
          </Button>

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
    </>
  );
}
