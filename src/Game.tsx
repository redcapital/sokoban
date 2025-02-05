import React, { useCallback, useRef } from "react";
import "./Game.css";
import { Help } from "./components/help";
import { useSokoban, Direction, State } from "./hooks/sokoban";
import { useKeyBoard } from "./hooks/keyboard";
import { Block } from "./hooks/levels";
import style from "./components/sokoban.module.css";
import { cn } from "./utils/classnames";
import { styleFrom, styleDirection } from "./utils/block-styles";

function Game() {
  const selectRef = useRef<HTMLSelectElement>(null);
  const {
    index,
    level,
    state,
    move,
    next,
    undo,
    restart,
    levels,
    loadLevel,
    replaySolution,
    moveCount,
  } = useSokoban();
  useKeyBoard(
    (event) => {
      switch (event.code) {
        case "ArrowUp":
          move(Direction.Top);
          break;
        case "ArrowDown":
          move(Direction.Bottom);
          break;
        case "ArrowLeft":
          move(Direction.Left);
          break;
        case "ArrowRight":
          move(Direction.Right);
          break;
        case "Enter":
          next();
          break;
        case "Backspace":
          undo();
          break;
        case "Escape":
          restart();
          break;
        case "KeyS":
          replaySolution();
          break;
      }
      event.preventDefault();
    },
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Enter",
      "Backspace",
      "Escape",
      "KeyS",
    ]
  );

  const onLoadClick = useCallback(() => {
    if (selectRef.current) {
      loadLevel(parseInt(selectRef.current.value, 10));
    }
  }, [loadLevel]);

  return (
    <div className="game">
      <div className={style.state}>
        <div className={style.levelPrefix}>Level {index + 1} :</div>
        <div className={style.levelTitle}>{level.name}</div>
        <select ref={selectRef} defaultValue={index}>
          {levels.map((level, idx) => (
            <option value={idx} key={level.name}>
              {level.name}
            </option>
          ))}
        </select>
        <button onClick={onLoadClick}>Load level</button>
      </div>
      <p>Move count: {moveCount}</p>

      <div className={style.board}>
        {level.shape.map((row) => (
          <div className={style.level}>
            {row.map((block) => (
              <div
                className={cn(
                  style.element,
                  styleFrom(block)!,
                  [Block.player, Block.playerOnObjective].includes(block)
                    ? styleDirection(level.playerDirection)
                    : ""
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <Help />
      {level.solution && (
        <div>
          <p>
            Solution:{" "}
            <textarea rows={1} cols={24}>
              {level.solution}
            </textarea>
          </p>
          <p>Solution moves: {level.solution.length}</p>
        </div>
      )}
      {state === State.completed && (
        <div className={style.state}>
          <div className={style.levelState}>LEVEL completed </div>
          <div className={style.helpNext}>Press ENTER to load next LEVEL</div>
        </div>
      )}
    </div>
  );
}

export default Game;
