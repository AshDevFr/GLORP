const SUFFIXES: ReadonlyArray<{ threshold: number; suffix: string }> = [
  { threshold: 1_000_000_000, suffix: "B" },
  { threshold: 1_000_000, suffix: "M" },
  { threshold: 1_000, suffix: "K" },
];

/**
 * Format a number with K / M / B suffixes for compact display.
 *
 * - Values < 1,000 → plain integer (e.g. "42")
 * - Values >= 1,000 → 2 decimal places + suffix (e.g. "1.23K")
 * - Negative values are prefixed with "-" and formatted the same way.
 */
export function formatNumber(n: number): string {
  if (n < 0) {
    return `-${formatNumber(-n)}`;
  }

  for (const { threshold, suffix } of SUFFIXES) {
    if (n >= threshold) {
      return `${(n / threshold).toFixed(2)}${suffix}`;
    }
  }

  if (n > 0 && n < 1) {
    return n.toFixed(2);
  }

  return Math.floor(n).toString();
}
