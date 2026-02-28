# GLORP

An AI Tamagotchi idle clicker game. Built as a demo project for 4shClaw (the multi-agent system that develops it).

## What This Is

GLORP (Generalized Learning Organism for Recursive Processing) is a browser-based idle/clicker game where you raise an ASCII AI creature. The game is the product; 4shClaw is the factory that builds it. The GitHub repo history, with clean commits, labeled issues, and structured PRs, is the portfolio piece.

The full PRD is at `PRD.md`. Read it before making design or gameplay decisions.

## Tech Stack

- **Runtime**: Node.js 24+
- **Language**: TypeScript (strict mode)
- **Build**: Vite 7
- **UI**: React 19 + Mantine 8
- **State**: Zustand 5
- **Validation**: Zod 4 (save data, import/export)
- **Utilities**: es-toolkit
- **Linting/Formatting**: Biome 2
- **Deployment**: GitHub Pages (build and deploy via GitHub Actions)
- **No backend**: all state lives in localStorage

## Repository

- **GitHub**: https://github.com/AshDevFr/GLORP
- **Live URL**: https://ashdevfr.github.io/GLORP/

## Deployment

GitHub Pages serves from a subpath, so Vite must be configured with `base: '/GLORP/'`. The GitHub Actions workflow builds the project and deploys the `dist/` output to GitHub Pages.

## Project Structure

```
GLORP/
├── PRD.md                    # Product requirements document
├── CLAUDE.md                 # This file
├── README.md                 # Public-facing project readme
├── index.html                # Vite entry HTML
├── package.json
├── tsconfig.json
├── biome.json                # Biome linter/formatter config
├── vite.config.ts
├── public/                   # Static assets
│   └── fonts/                # Monospace fonts for ASCII display
└── src/
    ├── main.tsx              # App entry point
    ├── App.tsx               # Root component
    ├── components/           # React components
    │   ├── pet/              # ASCII pet display, animations, speech bubble
    │   ├── upgrades/         # Upgrade cards, tier layout
    │   ├── stats/            # Stats bar, currency display
    │   └── ui/               # Shared UI (settings modal, achievement panel)
    ├── store/                # Zustand stores
    │   ├── game-store.ts     # Core game state (TD, upgrades, pet stats)
    │   ├── save-store.ts     # Save/load/export/import logic
    │   └── settings-store.ts # User preferences (effects, sound)
    ├── data/                 # Static game data
    │   ├── upgrades.ts       # Upgrade definitions (all tiers)
    │   ├── dialogue.ts       # Dialogue lines per stage/mood
    │   ├── ascii-art.ts      # ASCII art frames per stage/species
    │   ├── achievements.ts   # Achievement definitions
    │   └── species.ts        # Species definitions for prestige
    ├── engine/               # Game loop and mechanics
    │   ├── tick.ts            # Core game tick (auto-gen, mood decay, etc.)
    │   ├── evolution.ts       # Evolution stage transitions
    │   ├── economy.ts         # Cost scaling, multiplier calculations
    │   ├── offline.ts         # Offline progress calculation
    │   └── prestige.ts        # Prestige/rebirth logic
    ├── schemas/              # Zod schemas
    │   └── save.ts           # Save data validation for import/export
    ├── hooks/                # Custom React hooks
    ├── utils/                # Utility functions
    └── types/                # Shared TypeScript types
```

## Development Guidelines

### Dependency Version Policy

**Before adding or updating any dependency**, verify the latest stable version:

1. **Context7 MCP** (preferred): Use `resolve-library-id` then `query-docs`.
2. **Web search**: Search `<package name> latest version` to confirm.
3. **npm**: Run `npm view <package> version` as a fallback.

Do NOT rely on training data for version numbers. Always verify. Use exact versions (no `^` or `~`) in `package.json`.

### Code Style

- **Biome** handles both formatting and linting. Run `npx @biomejs/biome check --write .` before considering work complete.
- No ESLint, no Prettier. Biome is the single tool for both.
- Use `import type` for type-only imports.
- Prefer named exports over default exports.
- Keep components small and focused. One component per file.

### State Management

- All game state lives in Zustand stores under `src/store/`.
- Stores use Zustand's `persist` middleware for localStorage.
- Game logic (tick calculations, cost scaling, evolution checks) belongs in `src/engine/`, not in components or stores.
- Components read from stores via hooks; engine functions mutate stores.

### Game Data

- All static game data (upgrade definitions, dialogue, ASCII art) lives in `src/data/`.
- Data files export plain objects/arrays, not components or hooks.
- Dialogue, ASCII art, and upgrade definitions should be easy to extend without touching logic.

### Testing

- Use Vitest (ships with Vite).
- Game engine functions (`src/engine/`) should have unit tests. These are pure functions with predictable outputs.
- Component tests are optional but welcome for complex interactive elements.
- Run relevant tests during development, full suite before completing a phase.

### Git Workflow

- Branch per story/issue.
- Commit messages reference the GitHub issue number.
- PRs target `main`. GitHub Pages auto-deploys on merge via GitHub Actions.

### Build Phases

Development follows the phases defined in `PRD.md` (Phase 1 through Phase 7). Each phase produces a playable, deployable increment. Stories should be scoped to a single phase and labeled accordingly.

## Important Notes

- This is a pure client-side game. No API calls, no server, no database.
- The ASCII pet display uses a monospace font in a terminal-styled container. This area is custom-built, not Mantine components.
- Mantine is for everything else: upgrade cards, modals, settings, layout, buttons.
- Performance matters for the game tick loop. Keep it lean, avoid unnecessary re-renders.
- Number formatting (1K, 1M, 1B) is needed early. Use a shared utility.
