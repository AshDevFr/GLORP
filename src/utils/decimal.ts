/**
 * Centralized Decimal re-export and helper utilities for break_infinity.js.
 *
 * All game code should import Decimal and DecimalSource from this module
 * rather than directly from break_infinity.js. This gives us a single place
 * to add helpers and keeps the dependency isolated.
 */

import type { DecimalSource } from "break_infinity.js";
import Decimal from "break_infinity.js";

export { Decimal };
export type { DecimalSource };

/** Shorthand constructor — `D(value)` is equivalent to `new Decimal(value)`. */
export function D(value: DecimalSource): Decimal {
  return new Decimal(value);
}

/** Decimal zero constant (immutable — never mutate). */
export const ZERO = D(0);
/** Decimal one constant (immutable — never mutate). */
export const ONE = D(1);

/**
 * Convert a value to Decimal, treating null/undefined as zero.
 * Useful when reading potentially-missing persisted state fields.
 */
export function toDecimal(value: DecimalSource | null | undefined): Decimal {
  if (value === null || value === undefined) return D(0);
  return D(value);
}

/**
 * Serialize a Decimal to a JSON-safe number or string.
 * Values within Number.MAX_SAFE_INTEGER are stored as numbers for
 * backward-compatible saves; larger values are stored as strings.
 */
export function serializeDecimal(d: Decimal): number | string {
  const n = d.toNumber();
  if (Number.isFinite(n) && Math.abs(n) <= Number.MAX_SAFE_INTEGER) {
    return n;
  }
  return d.toString();
}

/**
 * Deserialize a value (number or string) back into a Decimal.
 * Handles legacy saves that stored values as plain numbers.
 */
export function deserializeDecimal(
  value: number | string | null | undefined,
): Decimal {
  if (value === null || value === undefined) return D(0);
  return D(value);
}
