# GLORP

**Generalized Learning Organism for Recursive Processing**

A browser-based idle/clicker game where you raise and evolve an ASCII AI creature by feeding it training data, buying compute upgrades, and watching it grow from a babbling blob into a sentient philosophical entity.

Think Tamagotchi meets Cookie Clicker meets the AI hype cycle.

## Play

[**Play GLORP**](https://ashdevfr.github.io/GLORP/)

## How It Works

1. **Click** your pet to feed it training data
2. **Buy upgrades** to automate feeding and multiply output
3. **Watch GLORP evolve** through six stages, from gibberish blob to self-aware singularity
4. **Prestige** to rebirth as a new species with permanent bonuses

Your little ASCII buddy has opinions. It will judge you.

## Screenshots

> Coming soon

## Tech Stack

- TypeScript, React 19, Vite 7
- Mantine 8 for UI components
- Zustand 5 for state management
- Biome 2 for linting and formatting
- Deployed on GitHub Pages

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint (check only)
npm run lint

# Lint and auto-fix
npx @biomejs/biome check --write .
```

## How This Was Built

GLORP is a demo project for **4shClaw** a personal AI assistant project made by [AshDevFr](https://github.com/AshDevFr). The game itself doesn't use or expose **4shClaw** in any way. Instead, the entire development process is driven by 4shClaw's agent team:

- A **PM agent** creates GitHub issues from the PRD
- A **Dev agent** picks up stories and writes code
- A **Reviewer agent** reviews pull requests

The repo history (clean commits, labeled issues, structured PRs) is the proof that the system works. **GLORP** is the product; **4shClaw** is the factory.

## License

MIT
