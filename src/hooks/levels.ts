import { useState, useMemo, useCallback } from "react";
import GameLevels from "../datas/game-levels.json";

export type Level = {
  name: string;
  shape: Block[][];
  width: number;
  height: number;
  solution?: string;
};

export interface SokobanLevels {
  Title: string;
  Description: string;
  Email: string;
  LevelCollection: LevelCollection;
}

export interface LevelCollection {
  Level: SokobanLevel[];
}

export interface SokobanLevel {
  Id: string;
  Width: string;
  Height: string;
  L: string[];
  solution: string;
}

export enum Block {
  empty,
  objective,
  box,
  boxOnObjective,
  player,
  playerOnObjective,
  wall,
}

const levelBlocks = {
  " ": Block.empty,
  ".": Block.objective,
  $: Block.box,
  "*": Block.boxOnObjective,
  "@": Block.player,
  "+": Block.playerOnObjective,
  "#": Block.wall,
};

type LevelBlock = keyof typeof levelBlocks;

const SOKOBAN_LEVEL_KEY = "SokobanLevel";

function loadLevels() {
  const AllLevels = [GameLevels] as SokobanLevels[];
  return AllLevels.flatMap((levels) =>
    levels.LevelCollection.Level.map((level) => ({
      name: level.Id,
      shape: level.L.map((row) =>
        Array.from(row).map((item) => levelBlocks[item as LevelBlock])
      ),
      width: Number(level.Width),
      height: Number(level.Height),
      solution: level.solution,
    }))
  );
}

export function useLevels() {
  const [levels] = useState<Level[]>(loadLevels);
  const [index, setIndex] = useState(() =>
    Number(localStorage.getItem(SOKOBAN_LEVEL_KEY))
  );
  const level = useMemo(() => levels[index], [levels, index]);
  const loadNext = useCallback(() => {
    setIndex(index + 1);
    localStorage.setItem(SOKOBAN_LEVEL_KEY, String(index + 1));
  }, [index]);
  const loadByIndex = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < levels.length) {
        setIndex(idx);
        localStorage.setItem(SOKOBAN_LEVEL_KEY, String(idx));
      }
    },
    [levels]
  );

  return { index, level, loadNext, levels, loadByIndex };
}
