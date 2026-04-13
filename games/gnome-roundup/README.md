# Gnome Roundup

A small browser minigame starter built with Phaser 3, TypeScript, and Vite.

## Workspace Metadata

- Name: Gnome Roundup
- Domain: lab
- Status: active
- Purpose: Small browser minigame prototype focused on herding gameplay
- Path: lab/games/gnome-roundup
- Related:
  - lab/games
- Tags:
  - game
  - phaser
  - minigame
  - prototype

## Stack

- Phaser 3
- TypeScript
- Vite

This project is intentionally local-only. It is not wired to the `pixel-lobby` Colyseus server.

## Run

```bash
npm install
npm run dev
```

Then open [http://localhost:5174](http://localhost:5174).

## Controls

- `WASD` or arrow keys to move
- Walk near baby dinos to gently herd them
- Guide all dinos into the corral pen
- `R` to restart a round

## Structure

- `src/main.ts`: bootstraps Phaser
- `src/scenes/BootScene.ts`: generates simple textures
- `src/scenes/RoundupScene.ts`: main local minigame

## AI Studio handoff prompt

```text
Build a small browser game using Phaser 3, TypeScript, and Vite.
Use a single Phaser.Scene or a few simple scenes.
Keep the art style minimal, soft, and rounded.
Output code that can drop into an existing Vite + Phaser project.
```
