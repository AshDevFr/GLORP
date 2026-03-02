import { useEffect, useRef } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const KONAMI_KEY = KONAMI_SEQUENCE.join(",");

/**
 * Calls onSuccess whenever the Konami code (↑↑↓↓←→←→BA) is entered.
 * Uses a ref for the callback so the listener is never re-created on re-render.
 */
export function useKonamiCode(onSuccess: () => void): void {
  const bufferRef = useRef<string[]>([]);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const buffer = [...bufferRef.current, e.key].slice(
        -KONAMI_SEQUENCE.length,
      );
      bufferRef.current = buffer;
      if (buffer.join(",") === KONAMI_KEY) {
        onSuccessRef.current();
        bufferRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
