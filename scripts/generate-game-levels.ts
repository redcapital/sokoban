// Generates Game file readable by sokoban web player
// input file: levels-with-optimized-solutions.json
// output file: game-levels.json

import { charToMove, Move } from "./src/Level";
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
  readFileSync("./levels-with-optimized-solutions.json", "utf-8")
);

const levelFile = {
  Title: "Sasquatch Levels",
  Description: "Sasquatch Levels",
  Email: "sasquatch@bentonrea.com",
  LevelCollection: {
    Level: levels.map((level) => {
      const lines = level.definition.split("\n");
      const height = lines.length;
      const width = lines.reduce(
        (prev, current) => Math.max(prev, current.length),
        0
      );
      return {
        Id: level.title,
        Width: width.toString(),
        Height: height.toString(),
        L: lines,
        solution: level.solution,
      };
    }),
  },
};

writeFileSync("./game-levels.json", JSON.stringify(levelFile));
