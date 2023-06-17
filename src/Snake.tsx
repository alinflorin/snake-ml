import { useCallback, useEffect, useState } from "react";
import styles from "./Snake.module.scss";
import { useInterval } from "./hooks/useInterval";

export interface SnakeProps {
  size: number;
  initialSnakeSize: number;
  difficulty: number;
  started: boolean;
}

interface Coords {
  i: number;
  j: number;
}

interface GameState {
  matrix: string[][];
  direction: string;
  snake: Coords[];
  reward: Coords;
  started: boolean;
  canPress: boolean;
  toAdd: Coords[];
}

const getRandomRewardCoords = (n: number, snakeArray: Coords[]) => {
  const range = n - 1 - 0 + 1;
  let randomNumberI = Math.floor(Math.random() * range) + 0;
  let randomNumberJ = Math.floor(Math.random() * range) + 0;

  while (
    snakeArray.findIndex(
      (s) => s.i === randomNumberI && s.j === randomNumberJ
    ) > -1
  ) {
    randomNumberI = Math.floor(Math.random() * range) + 0;
    randomNumberJ = Math.floor(Math.random() * range) + 0;
  }

  return {
    i: randomNumberI,
    j: randomNumberJ,
  };
};

const generateMatrix = (n: number, snakeArray: Coords[], reward: Coords) => {
  const result: string[][] = new Array<string[]>(n);
  for (let i = 0; i < n; i++) {
    result[i] = new Array<string>(n);
    for (let j = 0; j < n; j++) {
      result[i][j] = "E";
    }
  }

  result[reward.i][reward.j] = "R";

  for (let i = 0; i < snakeArray.length; i++) {
    if (i === 0) {
      result[snakeArray[i].i][snakeArray[i].j] = "H";
      continue;
    }
    result[snakeArray[i].i][snakeArray[i].j] = "B";
  }


  return result;
};

const areOppositeDirections = (oldDir: string, newDir: string) => {
  if ((oldDir === 'R' && newDir === 'L') || (oldDir === 'L' && newDir === 'R')) {
    return true;
  }
  if ((oldDir === 'U' && newDir === 'D') || (oldDir === 'D' && newDir === 'U')) {
    return true;
  }
  return false;
}

export const Snake = (props: SnakeProps) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const snakeArray: Coords[] = [];
    for (let i = 0; i < props.initialSnakeSize; i++) {
      snakeArray.push({
        i: 0,
        j: props.initialSnakeSize - i - 1,
      });
    }

    const rewardCoords = getRandomRewardCoords(props.size, snakeArray);

    return {
      direction: "R",
      started: false,
      snake: snakeArray,
      reward: rewardCoords,
      matrix: generateMatrix(props.size, snakeArray, rewardCoords),
      canPress: true,
      toAdd: []
    };
  });

  const loop = useCallback(() => {
    if (!gameState.started) {
      return;
    }
    try {
      let reward = gameState.reward;
      let toAdd = gameState.toAdd;

      const newSnakeArray = [
        ...gameState.snake.map((x) => ({ i: x.i, j: x.j } as Coords)),
      ];

      switch (gameState.direction) {
        case "R":
          newSnakeArray[0].j = newSnakeArray[0].j + 1;
          break;

        case "L":
          newSnakeArray[0].j = newSnakeArray[0].j - 1;
          break;

        case "U":
          newSnakeArray[0].i = newSnakeArray[0].i - 1;
          break;

        case "D":
          newSnakeArray[0].i = newSnakeArray[0].i + 1;
          break;
      }

      if (
        newSnakeArray[0].i < 0 ||
        newSnakeArray[0].i >= props.size ||
        newSnakeArray[0].j < 0 ||
        newSnakeArray[0].j >= props.size ||
        newSnakeArray.slice(1, props.size - 1).findIndex(x => x.i === newSnakeArray[0].i && x.j === newSnakeArray[0].j) > -1
      ) {
        alert("Game over");
        setGameState({ ...gameState, started: false, canPress: true });
        return;
      }


      const toRemove: number[] = [];
      for (let i = 0; i < toAdd.length; i++) {
        const lastSnakeEl = newSnakeArray[newSnakeArray.length - 1];
        const el = toAdd[i];
        if (lastSnakeEl.i === el.i && lastSnakeEl.j === el.j) {
          toRemove.push(i);
          newSnakeArray.push({i: el.i, j: el.j});
        }
      }

      for (const tr of toRemove) {
        toAdd.splice(tr, 1);
      }


      for (let i = 1; i < gameState.snake.length; i++) {
        newSnakeArray[i].i = gameState.snake[i - 1].i;
        newSnakeArray[i].j = gameState.snake[i - 1].j;
      }

      
      
      if (newSnakeArray[0].i === gameState.reward.i && newSnakeArray[0].j === gameState.reward.j) {
        toAdd.push({i: gameState.reward.i, j: gameState.reward.j});
        reward = getRandomRewardCoords(props.size, newSnakeArray);
      }

      setGameState({
        ...gameState,
        snake: newSnakeArray,
        matrix: generateMatrix(props.size, newSnakeArray, reward),
        canPress: true,
        reward: reward,
        toAdd: [...toAdd]
      });
    } catch (err) {
      console.log(err);
      alert("Finished.");
    }
  }, [gameState, setGameState, props.size]);

  useInterval(
    () => {
      loop();
    },
    gameState.started ? props.difficulty * 100 : null
  );

  useEffect(() => {
    if (props.started) {
      setGameState((s) => ({ ...s, started: props.started }));
    }
  }, [setGameState, props.started]);

  const keyPressHandler = useCallback((e: KeyboardEvent) => {
    console.log('Pressed ' + e.key)
    if (!gameState.started || !gameState.canPress) {
      return;
    }
    let newDir: string | undefined;

    switch (e.key) {
      case 'w':
        newDir = 'U';
      break;

      case 'a':
        newDir = 'L';
      break;

      case 's':
        newDir = 'D';
      break;

      case 'd':
        newDir = 'R';
      break;
    }

    if (newDir && newDir !== gameState.direction && !areOppositeDirections(gameState.direction, newDir)) {
      setGameState({...gameState, direction: newDir, canPress: false});
    }

  }, [setGameState, gameState]);

  useEffect(() => {
    window.addEventListener('keypress', keyPressHandler);

    return () => {
      window.removeEventListener('keypress', keyPressHandler);
    }
  }, [keyPressHandler]);

  return (
    <div className={styles.Snake}>
      {gameState.matrix.map((r, ri) => (
        <div
          className={styles.Row}
          style={{
            height: Math.round(100 / props.size) + "%",
          }}
          key={ri + ""}
        >
          {r.map((cell, ci) => (
            <div
              key={ri + "_" + ci}
              style={{
                width: Math.round(100 / props.size) + "%",
              }}
              className={styles.Cell + " " + styles["Cell_" + cell]}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Snake;
