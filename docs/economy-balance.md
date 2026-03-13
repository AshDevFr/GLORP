# Economy Balance Reference

Last updated: 2026-03-13 (Issue #107)

## Design Principles

1. **10× production ratio** between every consecutive generator (within the 8–12× target)
2. **10× cost ratio** between every consecutive generator
3. **50 s base payback** at quantity 1 for all generators (`baseCost / baseTdPerSecond = 50`)
4. **Effective mid-game payback of 2–5 min** arises naturally from the 1.15× exponential cost multiplier — by the 10th purchase of a generator the marginal payback is `50 × 1.15^9 ≈ 176 s ≈ 3 min`
5. Milestone and synergy multipliers are percentage-based and remain unchanged

## Generator Table

| # | ID | Tier | Cost | TD/s | Payback (s) | Prod Ratio | Cost Ratio |
|---|---|---|---|---|---|---|---|
| 1 | neural-notepad | garage-lab | 10 | 0.2 | 50 | — | — |
| 2 | data-hamster-wheel | garage-lab | 100 | 2 | 50 | 10× | 10× |
| 3 | pattern-antenna | garage-lab | 1 K | 20 | 50 | 10× | 10× |
| 4 | intern-algorithm | startup | 10 K | 200 | 50 | 10× | 10× |
| 5 | cloud-crumb | startup | 100 K | 2 K | 50 | 10× | 10× |
| 6 | gpu-toaster | startup | 1 M | 20 K | 50 | 10× | 10× |
| 7 | server-farm | scale-up | 10 M | 200 K | 50 | 10× | 10× |
| 8 | ml-cluster | scale-up | 100 M | 2 M | 50 | 10× | 10× |
| 9 | data-center | scale-up | 1 B | 20 M | 50 | 10× | 10× |
| 10 | neural-mainframe | scale-up | 10 B | 200 M | 50 | 10× | 10× |
| 11 | quantum-processor | mega-corp | 100 B | 2 B | 50 | 10× | 10× |
| 12 | continental-grid | mega-corp | 1 T | 20 B | 50 | 10× | 10× |
| 13 | global-mesh | mega-corp | 10 T | 200 B | 50 | 10× | 10× |
| 14 | dyson-compute-ring | mega-corp | 100 T | 2 T | 50 | 10× | 10× |
| 15 | mind-singularity | transcendence | 1 P | 20 T | 50 | 10× | 10× |
| 16 | recursive-self-model | transcendence | 10 P | 200 T | 50 | 10× | 10× |
| 17 | infinite-regression | transcendence | 100 P | 2 P | 50 | 10× | 10× |

Abbreviations: K = 10³, M = 10⁶, B = 10⁹, T = 10¹², P = 10¹⁵

## Cost Scaling (per-generator)

Each additional unit of the same generator costs `baseCost × 1.15^owned`.

| Units owned | Marginal cost multiplier | Effective payback |
|---|---|---|
| 0 | 1.00× | 50 s |
| 5 | 2.01× | 101 s |
| 10 | 4.05× | 202 s (3.4 min) |
| 15 | 8.14× | 407 s (6.8 min) |
| 20 | 16.37× | 818 s (13.6 min) |

The Prestige upgrade **Generator Discount** reduces the 1.15 exponent by 0.01 per level (max 3 levels → 1.12), flattening the curve.

## Milestone Multipliers (unchanged)

| Threshold | Multiplier |
|---|---|
| 10 owned | ×1.5 |
| 25 owned | ×2.0 |
| 50 owned | ×3.0 |
| 100 owned | ×6.0 |

These apply per-generator and stack multiplicatively with synergies.

## Synergies (unchanged)

| Source | Threshold | Targets | Bonus |
|---|---|---|---|
| neural-notepad | 50 | neural-notepad, data-hamster-wheel, pattern-antenna | +100% |
| data-hamster-wheel | 50 | intern-algorithm | +200% |
| gpu-toaster | 50 | server-farm | +150% |
| server-farm | 50 | data-center | +100% |
| ml-cluster | 50 | quantum-processor | +100% |
| quantum-processor | 50 | mind-singularity | +50% |

## Boosters (costs adjusted for new economy scale)

| ID | Stage | Multiplier | Old Cost | New Cost |
|---|---|---|---|---|
| series-a-funding | 1 | 2× | 25 K | 500 K |
| hype-train | 2 | 3× | 500 K | 50 M |
| consciousness-clause | 3 | 5× | 50 M | 500 B |
| dyson-sphere | 4 | 10× | 5 B | 50 P |

Booster costs are set at roughly 50× the base cost of the first generator in the corresponding stage’s tier group, ensuring they feel like a significant mid-tier purchase.

## Effective Production with Multipliers (examples)

A single generator at 50 owned with milestone (×3) and its synergy active:

| Generator | Base TD/s × 50 | + Milestone ×3 | + Synergy | Total |
|---|---|---|---|---|
| neural-notepad | 10 | 30 | ×2 = 60 | 60 TD/s |
| server-farm | 10 M | 30 M | ×2.5 = 75 M | 75 M TD/s |

## Notes

- Generators 16–17 have `baseCost` values above `Number.MAX_SAFE_INTEGER` (≈9×10¹⁵). JavaScript `Number` can still represent these values exactly as IEEE-754 doubles (they are exact powers of 10). Arithmetic at this scale may lose sub-unit precision, which is acceptable for an idle game.
- Evolution stage thresholds are **not** modified by this balance pass. The faster production curve means players reach stages more quickly, which is intentional — the pre-balance ratios made later stages feel unreachable.
- Prestige / Wisdom Token economy is out of scope for this pass.
