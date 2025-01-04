# Sokoban

My computer optimized solutions for Sokoban Sasquatch levels.

I solved Sokoban levels and wrote a program to optimize the solutions.

Optimization code is in `scripts/src/Level.ts`.

Solutions can be replayed here: http://redcapital.pw/sokoban/

Web player uses https://github.com/ecyrbe/sokoban by https://github.com/ecyrbe .

Some modifications were made to allow replays.

## To run locally

```
bun install
bun start
```

## Scripts

```
cd scripts/
bun generate-game-levels.ts # to generate game levels file for the sokoban web player
bun generate-optimized-levels # to run optimization script
```
