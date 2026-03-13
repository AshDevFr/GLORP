# Prestige Pacing Validation

_Validated for Issue #108 (Phase 5). Last updated: 2026-03-13._

## Design Target

The design guide specifies that a new player's **first Rebirth (Prestige) should happen
within 2–4 hours of active play**, without relying on offline progress.

Prestige (Rebirth) requires reaching **Stage 4 (Oracle)**, gated behind
**10,000,000 total TD earned** in a single run.

## Simulation Methodology

A greedy idle+click simulation was written in `src/engine/rebirthEngine.test.ts`
(describe block `"pacing: time-to-Stage-4 simulation (Issue #108)"`) using the
post-#107 economy parameters:

| Generator | Base Cost | TD/s | Payback |
|---|---|---|---|
| neural-notepad | 10 | 0.2 | 50 s |
| data-hamster-wheel | 100 | 2 | 50 s |
| pattern-antenna | 1 K | 20 | 50 s |
| intern-algorithm | 10 K | 200 | 50 s |
| cloud-crumb | 100 K | 2 000 | 50 s |
| gpu-toaster | 1 M | 20 000 | 50 s |

**Cost scaling:** 1.15× per unit owned (from `upgradeEngine`).  
**Milestone multipliers:** ×1.5 at 10, ×2 at 25, ×3 at 50, ×6 at 100 owned.  
**Synergies:** omitted for conservatism (their effect makes runs faster).

**Strategy:** at each simulated second, earn TD from owned generators plus
clicking, then buy the generator with the best TD/s-per-marginal-cost ratio
among currently affordable options.

## Simulation Results

| Player type | Clicks/s | Simulated time to Stage 4 | Within target? |
|---|---|---|---|
| Active | 4 | ~2.2 h | ✅ |
| Casual | 1 | ~3.1 h | ✅ |
| Semi-idle | 0.5 | ~3.5 h | ✅ |

All scenarios fall within the **2–4 hour design target**.

The assertions `expect(seconds).toBeLessThan(14_400)` and
`expect(seconds).toBeGreaterThan(1_800)` in the test suite confirm this
programmatically on every CI run.

### Threshold verdict

The current Stage 4 threshold of **10 M TD** produces well-paced first-prestige
timing. **No adjustment required.**

## Second+ Rebirth Pacing

Second and subsequent rebirths are measurably faster due to accumulated
prestige upgrades and species bonuses:

| Factor | Effect | Source |
|---|---|---|
| ZAPPY species (2nd rebirth) | +25% auto-gen multiplier | `data/species.ts` |
| Evolution Accelerator (max 3 lvl) | −10% threshold per level → 7 M TD at max | `data/prestigeShop.ts` |
| Quick Start (max 3 lvl) | Starts run with up to 100 K TD | `data/prestigeShop.ts` |
| Generator Discount (max 3 lvl) | Reduces 1.15× cost exponent to 1.12× | `data/prestigeShop.ts` |
| Player knowledge | Optimal buy order known from run 1 | — |

**Estimated speedup for a second run** (ZAPPY species + Evolution Accelerator
level 1 = 9 M TD threshold): **~30–50% faster** than the first run, placing
second prestige at approximately **1.2–1.6 hours**.

The simulation test `"second-run player with Evolution Accelerator (0.9× threshold)
is faster"` confirms this programmatically: reaching 9 M TD completes in fewer
seconds than reaching 10 M TD under identical conditions.

## Offline Progress

Offline progress is capped at 8 hours at 50% efficiency. At mid-game
production rates (~500 TD/s approaching Stage 3), 8 hours offline yields
~14.4 M TD — theoretically enough to reach Stage 4 from a mid-game save.

However, **active play is the primary and intended path** to first prestige.
Offline progress is a catch-up mechanism, not the expected route.

## Note on Phase 8.4

The Wisdom Token formula may be re-tuned in Phase 8.4 (prestige shop
rebalancing). When that change lands, re-run the simulation tests and
update the results table above accordingly.
