/**
 * Format a number with locale-aware comma separators for full display.
 *
 * - Values >= 1 → comma-separated integer (e.g. "1,234,567")
 * - Values between 0 and 1 → 2 decimal places (e.g. "0.50")
 * - Negative values are prefixed with "-" and formatted the same way.
 * - Very large numbers display cleanly without exponential notation.
 */
export function formatNumber(n: number): string {
  if (n < 0) {
    return `-${formatNumber(-n)}`;
  }

  if (n > 0 && n < 1) {
    return n.toFixed(2);
  }

  if (n === 0) return "0";

  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Math.floor(n),
  );
}

/**
 * Format a number with full comma-separated digits (e.g. "1,234,567,890").
 * Alias for formatNumber.
 */
export function formatNumberFull(n: number): string {
  return formatNumber(n);
}
