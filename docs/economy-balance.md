# Economy Balance Reference

This document describes the generator economy curve for GLORP. All values
reflect the base rates at quantity 1, with no upgrades, boosters, milestones,
or synergies applied.

## Design Principles

| Principle | Target |
|---|---|
| Production ratio between consecutive generators | 10x (within 8-12x guideline) |
| Cost ratio between consecutive generators | 10x |
| First-purchase payback (baseCost / baseTdPerSecond) | 50 s (within 30-60 s guideline) |
| Cost scaling exponent per repeated purchase | 1.15x |
| Mid-game Nth-purchase payback (10th-15th unit) | 2-5 minutes |

## Generator Reference Table

| # | ID | Name | Tier | Base Cost | Base TD/s | Payback (1st) | Prod Ratio |
|---|---|---|---|---|---|---|---|
| 1 | neural-notepad | Neural Notepad | garage-lab | 10 | 0.2 | 50 s | - |
| 2 | data-hamster-wheel | Data Hamster Wheel | garage-lab | 100 | 2 | 50 s | 10x |
| 3 | pattern-antenna | Pattern Antenna | garage-lab | 1,000 | 20 | 50 s | 10x |
| 4 | intern-algorithm | Intern Algorithm | startup | 10,000 | 200 | 50 s | 10x |
| 5 | cloud-crumb | Cloud Crumb | startup | 100,000 | 2,000 | 50 s | 10x |
| 6 | gpu-toaster | GPU Toaster | startup | 1,000,000 | 20,000 | 50 s | 10x |
| 7 | server-farm | Server Farm | scale-up | 10,000,000 | 200,000 | 50 s | 10x |
| 8 | ml-cluster | ML Cluster | scale-up | 100,000,000 | 2,000,000 | 50 s | 10x |
| 9 | data-center | Data Center | scale-up | 1,000,000,000 | 20,000,000 | 50 s | 10x |
| 10 | neural-mainframe | Neural Mainframe | scale-up | 10,000,000,000 | 200,000,000 | 50 s | 10x |
| 11 | quantum-processor | Quantum Processor | mega-corp | 100,000,000,000 | 2,000,000,000 | 50 s | 10x |
| 12 | continental-grid | Continental Grid | mega-corp | 1,000,000,000,000 | 20,000,000,000 | 50 s | 10x |
| 13 | global-mesh | Global Mesh | mega-corp | 10,000,000,000,000 | 200,000,000,000 | 50 s | 10x |
| 14 | dyson-compute-ring | Dyson Compute Ring | mega-corp | 100,000,000,000,000 | 2,000,000,000,000 | 50 s | 10x |
| 15 | mind-singularity | Mind Singularity | transcendence | 1,000,000,000,000,000 | 20,000,000,000,000 | 50 s | 10x |
| 16 | recursive-self-model | Recursive Self-Model | transcendence | 10,000,000,000,000,000 | 200,000,000,000,000 | 50 s | 10x |
| 17 | infinite-regression | Infinite Regression | transcendence | 100,000,000,000,000,000 | 2,000,000,000,000,000 | 50 s | 10x |

## Payback Curve (Cost Exponent Scaling)

Each additional unit of the same generator costs 1.15x more than the previous.
The first purchase always pays back in 50 seconds, but repeated purchases
take progressively longer:

| Nth Purchase | Cost Multiplier | Effective Payback |
|---|---|---|
| 1st | 1.00x | 50 s |
| 5th | 1.75x | 87 s (1.5 min) |
| 10th | 3.52x | 176 s (2.9 min) |
| 15th | 7.08x | 354 s (5.9 min) |
| 20th | 14.23x | 712 s (11.9 min) |
| 25th | 28.63x | 1,432 s (23.9 min) |

This means mid-game purchases (10th-15th unit of a generator) naturally fall
in the 2-6 minute payback range, creating the intended pacing tension.

## Milestone Multipliers (Phase 8.3)

Generator ownership milestones apply a flat multiplier to that generator's
total TD/s output. These stack with the base production and do not change the
cost curve.

| Owned | Multiplier | Effective per-unit rate |
|---|---|---|
| < 10 | 1.0x | base |
| 10+ | 1.5x | 1.5x base |
| 25+ | 2.0x | 2.0x base |
| 50+ | 3.0x | 3.0x base |
| 100+ | 6.0x | 6.0x base |

At 100 owned, the milestone multiplier (6x) partially offsets the cost
exponent (1.15^99 ~ 1,091,332x), keeping generators relevant at high counts.

## Synergy Bonuses (Phase 8)

Synergies activate when a source generator reaches 50 owned and apply a
percentage bonus to target generators. They stack multiplicatively with
milestones.

| Source (50 owned) | Target(s) | Bonus |
|---|---|---|
| Neural Notepad | Neural Notepad, Data Hamster, Pattern Antenna | +100% |
| Data Hamster Wheel | Intern Algorithm | +200% |
| GPU Toaster | Server Farm | +150% |
| Server Farm | Data Center | +100% |
| ML Cluster | Quantum Processor | +100% |
| Quantum Processor | Mind Singularity | +50% |

## Booster Multipliers

Global multipliers purchased with TD. Apply to all auto-generation.

| Booster | Cost | Stage | Multiplier |
|---|---|---|---|
| Series A Funding | 25,000 | 1 | 2x |
| Hype Train | 500,000 | 2 | 3x |
| Consciousness Clause | 50,000,000 | 3 | 5x |
| Dyson Sphere | 5,000,000,000 | 4 | 10x |

## Notes

- The cost scaling exponent (1.15x) can be reduced by the Generator Discount
  prestige upgrade (max -0.03, to 1.12x at level 3).
- Idle Boost prestige upgrade adds +25% auto-gen TD/s per level (max 5 levels).
- Offline progress is capped at 8 hours at 50% efficiency.
- Evolution stage thresholds (in stages.ts) are independent of generator
  balance and may need separate tuning after this rebalance.
