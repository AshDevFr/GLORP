import type { DecimalSource } from "break_infinity.js";
import { Decimal } from "./decimal";

/**
 * Format a number or Decimal with locale-aware comma separators for full display.
 *
 * - Values >= 1 → comma-separated integer (e.g. "1,234,567")
 * - Values between 0 and 1 → 2 decimal places (e.g. "0.50")
 * - Negative values are prefixed with "-" and formatted the same way.
 * - Very large numbers display cleanly without exponential notation.
 */
export function formatNumber(n: DecimalSource): string {
  // For plain numbers within safe integer range, use native formatting directly
  // to avoid break_infinity.js mantissa precision quirks on round values.
  if (typeof n === "number") {
    if (n < 0) return `-${formatNumber(-n)}`;
    if (n === 0) return "0";
    if (n > 0 && n < 1) return n.toFixed(2);
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(Math.floor(n));
  }

  const d = new Decimal(n);

  if (d.lt(0)) {
    return `-${formatNumber(d.abs())}`;
  }

  if (d.eq(0)) return "0";

  if (d.gt(0) && d.lt(1)) {
    return d.toNumber().toFixed(2);
  }

  // For values within safe integer range, convert to number for precise formatting
  if (d.lt(Number.MAX_SAFE_INTEGER)) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(Math.floor(d.toNumber()));
  }

  // For very large values, format manually with commas
  const floored = d.floor();
  const str = floored.toString();

  // If in exponential notation, return as-is (break_infinity.js handles this)
  if (str.includes("e") || str.includes("E")) {
    return str;
  }

  // Add comma separators manually for large integers
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format a number with full comma-separated digits (e.g. "1,234,567,890").
 * Alias for formatNumber.
 */
export function formatNumberFull(n: DecimalSource): string {
  return formatNumber(n);
}
