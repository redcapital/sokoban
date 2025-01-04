// Generates optimized solutions from solutions
// input file: levels-with-solutions.json
// output file: levels-with-optimized-solutions.json

import { charToMove, Level, Move } from "./src/Level";
import { readFileSync, writeFileSync } from "node:fs";

interface LevelWithSolution {
  title: string;
  definition: string;
  solution: string;
}

function movesToStr(moves: Move[]) {
  const mp = {
    [Move.Up]: "u",
    [Move.Right]: "r",
    [Move.Down]: "d",
    [Move.Left]: "l",
  };
  return moves.map((m) => mp[m]).join("");
}

function strToMoves(s: string): Move[] {
  let res: Move[] = [];
  for (let i = 0; i < s.length; i++) {
    res.push(charToMove(s[i]));
  }
  return res;
}

const levels: LevelWithSolution[] = JSON.parse(
  readFileSync("./levels-with-solutions.json", "utf-8")
);

const optimizedLevels: LevelWithSolution[] = [];

for (let i = 0; i < levels.length; i++) {
  const level = new Level(levels[i].definition);
  const originalSolution = strToMoves(levels[i].solution);
  const optimizedSolution = level.optimize(originalSolution, true);
  optimizedLevels.push({
    ...levels[i],
    solution: movesToStr(optimizedSolution),
  });
}

writeFileSync(
  "./levels-with-optimized-solutions.json",
  JSON.stringify(optimizedLevels)
);
