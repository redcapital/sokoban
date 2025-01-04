enum Objects {
  Box = 1,
  Wall = 2,
}

enum Move {
  Up = 1,
  Right = 2,
  Down = 3,
  Left = 4,
}

const charToMoveMap: { [key: string]: Move } = {
  r: Move.Right,
  R: Move.Right,
  d: Move.Down,
  D: Move.Down,
  l: Move.Left,
  L: Move.Left,
  u: Move.Up,
  U: Move.Up,
};

const allMoves: Move[] = [Move.Down, Move.Left, Move.Right, Move.Up];

function charToMove(char: string): Move {
  if (!charToMoveMap[char]) {
    throw new Error(`Invalid movement character: ${char}`);
  }
  return charToMoveMap[char];
}

enum MoveAttemptResult {
  DidNotMove = 1,
  Moved = 2,
  MovedBox = 3,
}

interface MoveResult {
  moveAttemptResult: MoveAttemptResult;
  isLevelSolved: boolean;
}

class GridLocation {
  private static readonly MAX_GRID_SIZE = 1e6;
  row: number;
  col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  move(m: Move): GridLocation {
    switch (m) {
      case Move.Down:
        return new GridLocation(this.row + 1, this.col);
      case Move.Left:
        return new GridLocation(this.row, this.col - 1);
      case Move.Right:
        return new GridLocation(this.row, this.col + 1);
      case Move.Up:
        return new GridLocation(this.row - 1, this.col);
    }
  }

  equals(x: GridLocation): boolean {
    return this.row === x.row && this.col === x.col;
  }

  hash() {
    return this.row * GridLocation.MAX_GRID_SIZE + this.col;
  }

  clone() {
    return new GridLocation(this.row, this.col);
  }

  toString() {
    return `(${this.row},${this.col})`;
  }
}

class Cell {
  private object: Objects | null;
  private isGoal: boolean;

  constructor(object: Objects | null, isGoal: boolean) {
    this.object = object;
    this.isGoal = isGoal;
  }

  hasBox() {
    return this.object === Objects.Box;
  }

  hasWall() {
    return this.object === Objects.Wall;
  }

  isOccupied() {
    return this.hasBox() || this.hasWall();
  }

  isSolved() {
    if (this.isGoal) {
      return this.hasBox();
    }
    return !this.hasBox();
  }

  putBox() {
    this.object = Objects.Box;
  }

  removeBox() {
    this.object = null;
  }

  toString(hasPlayer: boolean) {
    if (this.hasWall()) {
      return "#";
    }
    if (this.hasBox()) {
      return this.isGoal ? "*" : "$";
    }
    if (hasPlayer) {
      return this.isGoal ? "+" : "@";
    }
    return this.isGoal ? "." : " ";
  }

  clone() {
    return new Cell(this.object, this.isGoal);
  }

  equals(x: Cell) {
    return x.object === this.object && x.isGoal === this.isGoal;
  }
}

class Segment {
  move: Move;
  start: GridLocation;
  end: GridLocation;
  grid: Grid;

  constructor(move: Move, start: GridLocation, end: GridLocation, grid: Grid) {
    this.move = move;
    this.start = start;
    this.end = end;
    this.grid = grid;
  }
}

class Grid {
  private cells: Cell[][];

  constructor(cells: Cell[][]) {
    this.cells = cells;
  }

  clone() {
    const cells: Cell[][] = [];
    for (let i = 0; i < this.cells.length; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < this.cells[i].length; j++) {
        row.push(this.cells[i][j].clone());
      }
      cells.push(row);
    }
    return new Grid(cells);
  }

  toString(playerLocation: GridLocation) {
    let lines = "";
    for (let row = 0; row < this.cells.length; row++) {
      let line = "";
      for (let col = 0; col < this.cells[row].length; col++) {
        line += this.cells[row][col].toString(
          playerLocation.equals(new GridLocation(row, col))
        );
      }
      lines += line + "\n";
    }
    return lines;
  }

  getCell(location: GridLocation): Cell | undefined {
    if (
      location.row < 0 ||
      location.col < 0 ||
      location.row === this.cells.length ||
      location.col === this.cells[location.row].length
    ) {
      return undefined;
    }
    return this.cells[location.row][location.col];
  }

  isSolved() {
    for (let row = 0; row < this.cells.length; row++) {
      for (let col = 0; col < this.cells[row].length; col++) {
        if (!this.cells[row][col].isSolved()) {
          return false;
        }
      }
    }
    return true;
  }

  moveBox(from: GridLocation, to: GridLocation) {
    this.cells[from.row][from.col].removeBox();
    this.cells[to.row][to.col].putBox();
  }

  equals(x: Grid) {
    for (let row = 0; row < this.cells.length; row++) {
      for (let col = 0; col < this.cells[row].length; col++) {
        const cell = x.getCell(new GridLocation(row, col));
        if (!cell || !this.cells[row][col].equals(cell)) {
          return false;
        }
      }
    }
    return true;
  }
}

class Level {
  private grid: Grid;
  private playerLocation: GridLocation;
  private solved: boolean;
  private startingGrid: Grid;
  private startingPlayerLocation: GridLocation;

  constructor(definition: string) {
    this.startingPlayerLocation = new GridLocation(0, 0);

    const cells: Cell[][] = [];
    const lines = definition.split("\n");
    for (let row = 0; row < lines.length; row++) {
      if (lines[row].length === 0) {
        continue;
      }

      let gridLine: Cell[] = [];

      for (let col = 0; col < lines[row].length; col++) {
        const char = lines[row][col];
        switch (char) {
          case "\r":
            // Ignore line separator
            continue;
          case " ":
            gridLine.push(new Cell(null, false));
            break;
          case "#":
            gridLine.push(new Cell(Objects.Wall, false));
            break;
          case ".":
            gridLine.push(new Cell(null, true));
            break;
          case "$":
          case "*":
            gridLine.push(new Cell(Objects.Box, char === "*"));
            break;
          case "@":
          case "+":
            gridLine.push(new Cell(null, char === "+"));
            this.startingPlayerLocation.row = row;
            this.startingPlayerLocation.col = col;
            break;
        }
      }
      cells.push(gridLine);
    }
    this.startingGrid = new Grid(cells);
    this.solved = false;
    this.grid = this.startingGrid.clone();
    this.playerLocation = this.startingPlayerLocation.clone();
  }

  reset() {
    this.solved = false;
    this.grid = this.startingGrid.clone();
    this.playerLocation = this.startingPlayerLocation.clone();
  }

  move(move: Move): MoveResult {
    if (this.solved) {
      throw new Error("Level has been solved");
    }
    const moveAttemptResult = this.attemptMove(move);
    switch (moveAttemptResult) {
      case MoveAttemptResult.DidNotMove:
      case MoveAttemptResult.Moved:
        return { isLevelSolved: false, moveAttemptResult };
      case MoveAttemptResult.MovedBox:
        this.solved = this.grid.isSolved();
        return { isLevelSolved: this.solved, moveAttemptResult };
    }
  }

  toString() {
    return this.grid.toString(this.playerLocation);
  }

  play(moves: Move[]) {
    for (const m of moves) {
      this.move(m);
    }
    return this.solved;
  }

  printSegments(title: string, segments: Segment[]) {
    console.log(`printing segments ${title}: `);
    const mp = {
      [Move.Up]: "up",
      [Move.Right]: "right",
      [Move.Down]: "down",
      [Move.Left]: "left",
    };
    for (const seg of segments) {
      console.log(
        `Start at ${seg.start.toString()} move to ${seg.end.toString()} and push box to ${
          mp[seg.move]
        }`
      );
    }
  }

  segmentMerge(segments: Segment[]) {
    let finalSegments: Segment[] = [];

    let i = 0;
    while (i < segments.length) {
      let merged = false;
      for (let j = segments.length - 1; j > i; j--) {
        if (segments[i].grid.equals(segments[j].grid)) {
          const path = this.shortest(
            segments[i].start,
            segments[j].end,
            segments[i].grid
          );
          if (path !== undefined) {
            // Cost of walking segment i,i+1,...,j
            let cost1 = 0;
            for (let s = i; s <= j; s++) {
              const spath = this.shortest(
                segments[s].start,
                segments[s].end,
                segments[s].grid
              );
              if (spath === undefined) {
                console.log("WTF UNWALKABLE SEGMENT", segments[s]);
              } else {
                cost1 += spath.length + 1;
              }
            }

            // Cost of walking from start of i to end of j + move
            let cost2 = path.length + 1;

            if (cost2 < cost1) {
              finalSegments.push(
                new Segment(
                  segments[j].move,
                  segments[i].start,
                  segments[j].end,
                  segments[j].grid
                )
              );
              merged = true;
              i = j + 1;
              break;
            }
          }
        }
      }
      if (!merged) {
        finalSegments.push(segments[i]);
        i++;
      }
    }
    return finalSegments;
  }

  optimize(solution: Move[], segmentOptimization = false): Move[] {
    const segments: Segment[] = [];
    let startLocation = this.playerLocation.clone();
    let startGrid = this.grid.clone();
    for (const move of solution) {
      const currentLocation = this.playerLocation.clone();
      const moveResult = this.move(move);
      if (moveResult.moveAttemptResult === MoveAttemptResult.MovedBox) {
        segments.push(
          new Segment(move, startLocation, currentLocation, startGrid)
        );
        startLocation = this.playerLocation.clone();
        startGrid = this.grid.clone();
      }
    }
    const result: Move[] = [];
    this.reset();

    let finalSegments = segments;
    if (segmentOptimization) {
      while (true) {
        const merged = this.segmentMerge(finalSegments);
        const didMerge = merged.length !== finalSegments.length;
        finalSegments = merged;
        if (!didMerge) {
          break;
        }
      }
    } else {
      finalSegments = segments;
    }

    for (const segment of finalSegments) {
      const shortest = this.shortest(segment.start, segment.end, segment.grid);
      if (shortest === undefined) {
        // should not happen
        console.log(
          `Path not found from ${segment.start.toString()} to ${segment.end.toString()}`
        );
      }
      if (shortest) {
        result.push(...shortest);
      }
      result.push(segment.move);
    }
    this.reset();
    return result;
  }

  shortest(a: GridLocation, b: GridLocation, grid: Grid): Move[] | undefined {
    const state: {
      [key: number]: { move: Move; from: GridLocation; distance: number };
    } = {};
    const queue: GridLocation[] = [];
    queue.push(a);
    state[b.hash()] = { move: Move.Down, from: a, distance: 1e9 };
    state[a.hash()] = { move: Move.Down, from: a, distance: 0 };
    while (queue.length > 0) {
      const top = queue.shift()!;
      const st = state[top.hash()];
      if (st.distance >= state[b.hash()].distance) {
        continue;
      }
      for (const move of allMoves) {
        const nextLocation = top.move(move);
        const cell = grid.getCell(nextLocation);
        if (cell && !cell.isOccupied()) {
          if (state[nextLocation.hash()]?.distance <= st.distance) {
            continue;
          }
          queue.push(nextLocation);
          state[nextLocation.hash()] = {
            move,
            from: top,
            distance: st.distance + 1,
          };
        }
      }
    }
    if (state[b.hash()].distance === 1e9) {
      return undefined;
    }

    const result: Move[] = [];
    let cur = b;
    while (state[cur.hash()]) {
      if (cur.equals(a)) {
        break;
      }
      result.push(state[cur.hash()].move);
      cur = state[cur.hash()].from;
    }
    result.reverse();
    return result;
  }

  private attemptMove(move: Move): MoveAttemptResult {
    const location = this.playerLocation.move(move);
    const cell = this.grid.getCell(location);

    if (!cell || cell.hasWall()) {
      return MoveAttemptResult.DidNotMove;
    }

    const hadBox = cell.hasBox();
    if (hadBox) {
      const nextLocation = location.move(move);
      const nextCell = this.grid.getCell(nextLocation);

      if (!nextCell || nextCell.isOccupied()) {
        return MoveAttemptResult.DidNotMove;
      }

      this.grid.moveBox(location, nextLocation);
    }

    this.playerLocation = location;
    return hadBox ? MoveAttemptResult.MovedBox : MoveAttemptResult.Moved;
  }
}

export { Level, charToMove, MoveAttemptResult, Move, Objects, Cell };
