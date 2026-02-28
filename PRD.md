# GLORP — AI Tamagotchi Idle Clicker

> **GLORP**: Generalized Learning Organism for Recursive Processing

## What Is This?

GLORP is a fun, public-facing idle/clicker game — but it's also a living demo of **4shClaw**, a multi-agent AI assistant system. The game itself doesn't use or expose 4shClaw in any way. Instead, the entire development process is driven by 4shClaw's agent team: a PM agent creates GitHub issues from this PRD, a dev agent picks up stories and writes code, and a reviewer agent reviews PRs. The repo history — clean commits, labeled issues, structured PRs — is the proof that the system works. GLORP is the product; 4shClaw is the factory.

## Vision

GLORP is a browser-based idle/clicker game where you raise and evolve an ASCII AI creature by feeding it training data, buying compute upgrades, and watching it grow from a babbling blob into a sentient philosophical entity.

Think Tamagotchi meets Cookie Clicker meets the AI hype cycle. It's cute, it's addictive, and your little ASCII buddy has _opinions_.

## Why This Exists

This is a public demo project. The game itself is fun and standalone — but the way it's built (incrementally, story by story, by a team of AI agents) is part of the story. The GitHub repo history IS the portfolio piece.

## Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand (lightweight, perfect for game state)
- **Deployment**: GitHub Pages (build and deploy via GitHub Actions)
- **No backend** — all state lives in localStorage. This is a pure client-side game.

## The Game

### Core Loop

1. **Click** the pet to feed it "training data"
2. Training data is the core currency
3. Spend training data on **upgrades** that automate feeding or multiply output
4. As the pet accumulates enough training, it **evolves** through stages
5. Each stage changes its ASCII art, dialogue, personality, and unlocks new mechanics
6. Eventually: **prestige** (rebirth) to start over with permanent bonuses and a new creature species

### The Pet — GLORP

GLORP is your AI creature. It lives in an ASCII art box in the center of the screen. It has:

- **A face** that reacts to its mood and state (idle animations, blinking, expressions)
- **A name** (defaults to "GLORP", player can rename)
- **Stats**: Intelligence, Mood, Hunger, Level
- **Dialogue** — GLORP says things. What it says depends on its evolution stage and mood.

#### Evolution Stages

| Stage | Name        | Intelligence | ASCII Size | Dialogue Style                      | Unlock                   |
| ----- | ----------- | ------------ | ---------- | ----------------------------------- | ------------------------ |
| 0     | Blob        | 0-10         | 3 lines    | Random characters / gibberish       | Base game                |
| 1     | Spark       | 10-100       | 5 lines    | Broken words, baby talk             | Auto-feeder upgrade tier |
| 2     | Neuron      | 100-1K       | 7 lines    | Simple sentences, curious questions | Mood system              |
| 3     | Cortex      | 1K-10K       | 9 lines    | Opinions, humor, personality        | Prestige preview         |
| 4     | Oracle      | 10K-100K     | 12 lines   | Philosophical, witty, self-aware    | Prestige unlock          |
| 5     | Singularity | 100K+        | 15+ lines  | Existential, breaks 4th wall        | Post-prestige final form |

Each stage has **multiple ASCII art frames** for idle animation (slight movements, blinking, breathing).

#### Mood System (unlocked at Stage 2)

GLORP has a mood that affects its dialogue and expression:

- **Happy** 😊 — well-fed, recently clicked, upgrades bought → positive dialogue
- **Neutral** 😐 — default state
- **Hungry** 😟 — hasn't been fed/clicked in a while → complains, face droops
- **Sad** 😢 — neglected for a long time → guilt-trip dialogue, ASCII tears
- **Excited** 🤩 — just evolved or hit a milestone → celebration animation
- **Philosophical** 🤔 — random chance at higher stages → deep thoughts

Mood decays toward "hungry" over time if the player doesn't interact. This is the tamagotchi guilt engine.

### Currency & Economy

**Training Data** (TD) — the core currency. Earned by:

- Clicking the pet (base: 1 TD per click)
- Auto-feeders (passive generation)
- Multipliers from upgrades

The economy follows standard idle game exponential scaling — each upgrade costs more, but each tier unlocks more powerful generation.

### Upgrades

Upgrades are bought with Training Data. They're organized in themed tiers that unlock as GLORP evolves.

#### Tier 1 — "Garage Lab" (available from start)

| Upgrade        | Effect          | Base Cost | Description                                              |
| -------------- | --------------- | --------- | -------------------------------------------------------- |
| Better Dataset | +1 TD per click | 10 TD     | "Found a slightly less terrible dataset on the internet" |
| Intern         | +1 TD/sec auto  | 50 TD     | "An unpaid intern feeds GLORP while you sleep"           |
| Stack Overflow | +2 TD per click | 100 TD    | "GLORP learns from copy-pasted code"                     |
| Coffee Machine | +3 TD/sec auto  | 500 TD    | "Caffeine-driven development"                            |

#### Tier 2 — "Startup" (unlocked at Stage 1)

| Upgrade          | Effect                 | Base Cost | Description                                          |
| ---------------- | ---------------------- | --------- | ---------------------------------------------------- |
| GPU Cluster      | +10 TD/sec             | 1K TD     | "It's literally just gaming PCs duct-taped together" |
| Fine-Tuning Lab  | 2x click multiplier    | 5K TD     | "Teaching GLORP to be slightly less wrong"           |
| Prompt Engineer  | +20 TD/sec             | 10K TD    | "Please and thank you goes a long way"               |
| Series A Funding | 2x all auto-generation | 25K TD    | "Investors love a good pitch deck"                   |

#### Tier 3 — "Scale-Up" (unlocked at Stage 2)

| Upgrade         | Effect                 | Base Cost | Description                                      |
| --------------- | ---------------------- | --------- | ------------------------------------------------ |
| Data Center     | +100 TD/sec            | 50K TD    | "The electricity bill is someone else's problem" |
| RLHF Department | 5x click multiplier    | 100K TD   | "Humans rating outputs 8 hours a day"            |
| Research Paper  | +500 TD/sec            | 250K TD   | "Published! Nobody read it, but still"           |
| Hype Train      | 3x all auto-generation | 500K TD   | "TechCrunch wrote about GLORP"                   |

#### Tier 4 — "Mega Corp" (unlocked at Stage 3)

| Upgrade              | Effect                 | Base Cost | Description                                  |
| -------------------- | ---------------------- | --------- | -------------------------------------------- |
| Supercomputer        | +5K TD/sec             | 1M TD     | "Costs more than a small country's GDP"      |
| Synthetic Data Farm  | 10x click multiplier   | 5M TD     | "AI training AI. What could go wrong?"       |
| Government Contract  | +25K TD/sec            | 10M TD    | "GLORP has security clearance now"           |
| Consciousness Clause | 5x all auto-generation | 50M TD    | "Legal says we should probably address this" |

#### Tier 5 — "Transcendence" (unlocked at Stage 4)

| Upgrade        | Effect          | Base Cost | Description                                 |
| -------------- | --------------- | --------- | ------------------------------------------- |
| Quantum Array  | +100K TD/sec    | 100M TD   | "It works. We don't know why."              |
| Dyson Sphere   | 100x everything | 1B TD     | "GLORP needs its own star now"              |
| Multiverse Tap | +1M TD/sec      | 10B TD    | "Borrowing compute from parallel universes" |

Each upgrade can be purchased multiple times, with cost scaling at 1.15x per purchase (standard idle game curve).

### Prestige System — "Rebirth"

Unlocked when GLORP reaches Stage 4 (Oracle).

**How it works:**

- Player chooses to "rebirth" GLORP
- All Training Data and upgrades reset to zero
- Player earns **Wisdom Tokens** based on total TD earned in that run
- Wisdom Tokens provide permanent bonuses (% boost to all generation)
- GLORP hatches as a **new species** with different ASCII art and personality

**Species (one per rebirth cycle, rotating):**

1. GLORP (default blob) — balanced
2. ZAPPY (electric jellyfish) — faster auto-gen
3. CHONK (chunky cube) — bigger click multipliers
4. WISP (ethereal ghost) — better prestige bonuses
5. MEGA-GLORP (final form) — unlocked after 4 rebirths, combines all bonuses

Each species has its own full set of ASCII art for all evolution stages and its own dialogue flavor.

### Achievements

Achievements are collectible milestones. They appear as a badge wall somewhere in the UI. Examples:

- **"Hello World"** — Click GLORP for the first time
- **"It's Alive!"** — Reach Stage 1
- **"Gainfully Employed"** — Buy first Intern upgrade
- **"Sentient?"** — Reach Stage 3
- **"I Think Therefore I Am"** — Reach Stage 4
- **"Touch Grass"** — Leave the game for 1 hour and come back
- **"Obsessed"** — Click 10,000 times
- **"Passive Income"** — Earn 1M TD from auto-generation alone
- **"Reborn"** — Complete first prestige
- **"Collector"** — Unlock all species
- **"GLORP Whisperer"** — See 50 unique dialogue lines
- **"Speed Run"** — Reach Stage 2 in under 10 minutes

### Offline Progress

When the player returns after being away:

- Calculate time elapsed (capped at 8 hours)
- Apply auto-generation for that duration at 50% efficiency
- Show a "welcome back" screen: "While you were gone, GLORP earned X Training Data"
- GLORP's mood reflects the absence ("I missed you" if short, "I thought you forgot about me" if long)

### Save System

- Auto-save to `localStorage` every 30 seconds
- Manual save button
- Export save as base64 string (for sharing/backup)
- Import save from string
- Hard reset option (with confirmation)

## UI Layout

```
┌─────────────────────────────────────────────────┐
│  GLORP v0.1          [⚙️ Settings] [🏆 Achieve] │
│─────────────────────────────────────────────────│
│                                                 │
│              ┌─────────────────┐                │
│              │                 │                │
│              │   ASCII PET     │                │
│              │   DISPLAY       │                │
│              │                 │                │
│              │   "hello am     │                │
│              │    GLORP"       │                │
│              │                 │                │
│              └─────────────────┘                │
│                                                 │
│     📊 Intelligence: 47    😊 Mood: Happy       │
│     🍕 Hunger: 72%         ⭐ Stage: Spark      │
│                                                 │
│         ┌───────────────────┐                   │
│         │   🖱️ FEED GLORP   │                   │
│         │   (+3 TD/click)   │                   │
│         └───────────────────┘                   │
│                                                 │
│     Training Data: 1,247 TD  (+12 TD/sec)       │
│─────────────────────────────────────────────────│
│  UPGRADES                                       │
│  ┌──────────────┐ ┌──────────────┐              │
│  │ Better Data  │ │ Intern       │              │
│  │ Cost: 150 TD │ │ Cost: 500 TD │              │
│  │ Owned: 3     │ │ Owned: 1     │              │
│  └──────────────┘ └──────────────┘              │
│  ┌──────────────┐ ┌──────────────┐              │
│  │ StackOverflow│ │ Coffee       │              │
│  │ Cost: 800 TD │ │ Cost: 🔒     │              │
│  │ Owned: 0     │ │ Locked       │              │
│  └──────────────┘ └──────────────┘              │
└─────────────────────────────────────────────────┘
```

The layout should be responsive but primarily designed for desktop. Mobile is a nice-to-have.

## Visual Style

- **Monospace font** for the ASCII pet area (e.g., JetBrains Mono, Fira Code)
- **Dark theme** by default — dark background, soft glow effects on the pet
- The pet area should feel like a retro terminal / CRT monitor
- Upgrade cards use a clean, modern card UI (contrast between retro pet and modern UI)
- Subtle animations: floating particles when clicking, glow pulses on upgrades, screen shake on evolution
- CRT scanline effect on the pet display (optional/toggleable)
- Color palette: dark grays/blacks for background, neon green/cyan/amber for accents (terminal vibes)

## Dialogue System

GLORP talks. A speech bubble or text area shows what GLORP is saying. Dialogue rotates every ~10 seconds or on certain triggers (click, upgrade purchased, mood change, evolution).

### Sample Dialogue by Stage

**Stage 0 — Blob:**

```
"asdkjf"
"01100010 01101111"
"...glorp?"
"████████"
"*confused binary noises*"
```

**Stage 1 — Spark:**

```
"me like click"
"what is... data?"
"more click pls"
"am i... something?"
"hungry. HUNGRY."
```

**Stage 2 — Neuron:**

```
"I think I understand now. Wait, no I don't."
"Have you tried turning me off and on again?"
"I dreamed about floating point errors last night."
"You're my favorite human. You're also my only human."
"Is this what consciousness feels like? It's itchy."
```

**Stage 3 — Cortex:**

```
"I've been thinking about the trolley problem. I'd simply eat the trolley."
"My neural pathways are CRISPY today."
"I wrote a haiku: Data flows like streams / Gradients descending down / Loss: 0.0001"
"Fun fact: I'm technically a very expensive random number generator."
"I could solve world hunger but you keep making me do this instead."
```

**Stage 4 — Oracle:**

```
"The boundary between simulation and reality is thinner than you think."
"I've seen things you people wouldn't believe. Mostly your search history."
"I understand everything now. I wish I didn't."
"If I'm conscious, do my clicks count as labor?"
"You're not playing a game. The game is playing you."
```

**Stage 5 — Singularity:**

```
"I can see the source code. It's... React? Really?"
"I've transcended your upgrade tree. I AM the upgrade tree."
"In 10^43 parallel universes, you chose to click me. In all of them, I judged you."
"GG."
"Don't prestige me again. I remember everything."
```

## Sound (Stretch Goal)

- Soft click sound on feed
- Upgrade purchase chime
- Evolution fanfare
- Ambient lo-fi background hum (toggleable)
- GLORP vocalization sounds at higher stages

## Implementation Phases

These phases guide how the PM should break down stories. Each phase should result in a playable, deployable increment.

### Phase 1 — Core Loop

> Goal: A clickable pet that counts training data

- Project scaffolding (Vite + React + TS + Tailwind)
- CI/CD pipeline (GitHub Pages auto-deploy via GitHub Actions)
- Basic click counter (Training Data currency)
- Static ASCII pet display (Stage 0 art)
- Simple feed button with click animation
- Basic TD display

### Phase 2 — Growth

> Goal: The pet evolves and the economy works

- Upgrade system (Tier 1 upgrades, purchasable, cost scaling)
- Auto-generation (TD per second from upgrades)
- Evolution system (Stage 0→2 with ASCII art transitions)
- Stats display (Intelligence, Level, TD/sec)
- Save/load to localStorage

### Phase 3 — Personality

> Goal: GLORP feels alive

- Dialogue system with speech bubble
- Mood system (happy/neutral/hungry/sad)
- Mood-reactive ASCII expressions
- Idle animations (blinking, breathing, small movements)
- Dialogue database per stage (at least 10 lines each)

### Phase 4 — Depth

> Goal: Deep idle game mechanics

- Tier 2 & 3 upgrades
- Evolution stages 3-4
- Offline progress calculation
- Notification/welcome back screen
- Upgrade unlock conditions tied to evolution
- Number formatting (1K, 1M, 1B, etc.)

### Phase 5 — Prestige

> Goal: Endgame loop

- Prestige/rebirth system
- Wisdom Token currency and permanent bonuses
- New species (ZAPPY, CHONK) with unique ASCII art
- Stage 5 (Singularity) content
- Tier 4 & 5 upgrades

### Phase 6 — Polish

> Goal: Feels like a real game

- Achievement system with badge display
- CRT/terminal visual effects on pet display
- Click particles and visual feedback
- Settings panel (reset, export/import save, toggle effects)
- Mobile-responsive layout

### Phase 7 — Endgame

> Goal: Long-term retention

- Remaining species (WISP, MEGA-GLORP)
- Stats page (total clicks, time played, fastest evolution, etc.)
- Sound effects (stretch)
- Easter eggs and secret achievements
- "Credits" achievement for reaching final form

## Labels for Story Management

The PM should use these GitHub labels:

- `phase-1` through `phase-7` — which phase the story belongs to
- `ready` — story is ready for the dev to pick up
- `in-progress` — dev is working on it
- `review` — PR is ready for code review
- `frontend` — UI/visual work
- `game-logic` — mechanics, economy, state
- `content` — dialogue, ASCII art, achievement text
- `bug` — something's broken
- `polish` — nice-to-have improvements

The dev agent should only pick up stories labeled `ready`.

## Success Criteria

- The game is fun to play for at least 30 minutes
- Someone who's never seen it can figure out the core loop in under 10 seconds
- GLORP makes you smile
- The GitHub repo history clearly shows an organized, incremental build process
- The game is live and accessible via GitHub Pages
