# Lantern Lane — Spot the Difference

[![Competition](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sastra-wev/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sastra-wev/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

An original spot-the-difference game for the make.fun bounty [best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451). Three hand-drawn scenes — a sunny cottage garden, a harbour at dusk, and a cozy library — each shown as two near-identical pictures side by side. The right-hand picture hides a few changes; find them all before the lantern timer runs out.

## How to play

- **Click or tap** a difference in *either* picture — it gets ringed in both panels.
- The pips and the **"N to find"** counter at the top track what remains.
- A wrong click costs **5 seconds**; **three strikes** end the level.
- **Hint button / H key** (3 per level) briefly rings one unfound difference, for −10s.
- **P** pauses, **R** restarts the level, **Enter** starts and advances.
- Scoring: 100 points per difference plus a 5-points-per-second time bonus per level.

Levels: Sunny Garden (5 differences, 120s) · Harbour at Dusk (6, 150s) · The Cozy Library (7, 180s). Win, lose, pause and level-complete states are all included, with small synthesised WebAudio sound effects (no audio files).

## Run it

The game is plain static files under `game/` — no build step, no network requests. Serve it locally:

```
node serve.ts            # then open http://localhost:8080
```

Hand the entry in (copies `game/` and `screenshots/` to the output and writes `dossier.json`):

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `game/index.html` — the page (one canvas, offline, no external references)
- `game/src/scenes.js` — the three scenes, drawn in code twice: base and changed variant, so every difference sits at exact coordinates
- `game/src/main.js` — game state, click/tap detection, timer, scoring, markers, screenshot staging (`?shot=start|play|end`)
- `game/src/audio.js` — tiny synthesised sound effects
- `main.ts` — the hand-in program (Node 22, standard library only)
- `vendor/makefun-game.ts` — the make.fun dossier library, copied from the kit unchanged
- `screenshots/` — real renders of the game

All art, names and code are original. MIT licensed.
