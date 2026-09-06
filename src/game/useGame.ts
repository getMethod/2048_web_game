import { useCallback, useEffect, useLayoutEffect, useReducer, useState } from 'react';
import { spawnRandomTile, canMove, createInitialBoard, hasWinningTile, moveBoard } from './engine';
import { loadBestScore, loadGameState, saveBestScore, saveGameState } from './storage';
import type {
  Direction,
  GameAction,
  GameState,
  GameSession,
  RandomSource,
  RandomRolls,
} from './types';

export function createSession(state: GameState): GameSession {
  return {
    ...state,
    revision: 0,
    presentation: null,
    recordBaseline: state.bestScore,
    recordCelebrated: false,
    recordEvent: null,
  };
}

export function createGameState(random: RandomSource = Math.random): GameSession {
  const restored = loadGameState();
  const storedBest = loadBestScore();

  if (restored) {
    return createSession({
      ...restored,
      bestScore: Math.max(restored.bestScore, storedBest, restored.score),
    });
  }

  return createSession({
    board: createInitialBoard(random),
    score: 0,
    bestScore: storedBest,
    previous: null,
    status: 'playing',
  });
}

export function gameReducer(state: GameSession, action: GameAction): GameSession {
  // 每次 Reducer 调用从相同采样值开始，React StrictMode 重算不会额外取随机数。
  let rollIndex = 0;
  const random = () => ('rolls' in action ? (action.rolls[rollIndex++] ?? 0) : 0);
  switch (action.type) {
    case 'move': {
      if (state.status === 'won' || state.status === 'lost') return state;
      const result = moveBoard(state.board, action.direction);
      if (!result.moved) return state;

      const spawned = spawnRandomTile(result.board, random);
      const board = spawned.board;
      const score = state.score + result.scoreGained;
      let status: GameState['status'] = state.status;

      if (state.status === 'playing' && hasWinningTile(board)) status = 'won';
      else if (!canMove(board)) status = 'lost';

      const revision = state.revision + 1;
      const newRecord = !state.recordCelebrated && score > state.recordBaseline;
      return {
        ...state,
        revision,
        presentation: {
          id: revision,
          paths: result.paths,
          merges: result.merges,
          spawned: spawned.tile,
          scoreGained: result.scoreGained,
        },
        recordCelebrated: state.recordCelebrated || newRecord,
        recordEvent: newRecord ? revision : state.recordEvent,
        board,
        score,
        bestScore: Math.max(state.bestScore, score),
        previous: { board: state.board, score: state.score },
        status,
      };
    }
    case 'undo': {
      if (!state.previous) return state;
      const previous = state.previous;
      return {
        ...state,
        presentation: null,
        recordEvent: null,
        board: previous.board,
        score: previous.score,
        previous: null,
        status: hasWinningTile(previous.board) ? 'continued' : 'playing',
      };
    }
    case 'continue':
      return state.status === 'won'
        ? { ...state, status: 'continued', presentation: null, recordEvent: null }
        : state;
    case 'new-game':
      return {
        ...state,
        revision: state.revision + 1,
        presentation: null,
        recordBaseline: state.bestScore,
        recordCelebrated: false,
        recordEvent: null,
        board: createInitialBoard(random),
        score: 0,
        bestScore: state.bestScore,
        previous: null,
        status: 'playing',
      };
  }
}

const directionByKey: Readonly<Record<string, Direction>> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
};

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function sampleRolls(): RandomRolls {
  return [Math.random(), Math.random(), Math.random(), Math.random()];
}

export interface UseGameResult {
  state: GameSession;
  directionFeedback: { direction: Direction; id: number } | null;
  clearDirectionFeedback: (id: number) => void;
  move: (direction: Direction) => void;
  undo: () => void;
  continueGame: () => void;
  newGame: () => void;
}

export function useGame(): UseGameResult {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createGameState());
  const [directionFeedback, setDirectionFeedback] = useState<{
    direction: Direction;
    id: number;
  } | null>(null);

  useEffect(() => {
    saveGameState(state);
    saveBestScore(state.bestScore);
  }, [state]);

  const signalDirection = useCallback((direction: Direction) => {
    setDirectionFeedback((current) => ({ direction, id: (current?.id ?? 0) + 1 }));
  }, []);

  const clearDirectionFeedback = useCallback((id: number) => {
    setDirectionFeedback((current) => (current?.id === id ? null : current));
  }, []);

  const move = useCallback(
    (direction: Direction) => {
      signalDirection(direction);
      dispatch({ type: 'move', direction, rolls: sampleRolls() });
    },
    [signalDirection],
  );

  useEffect(() => {
    const clear = () => setDirectionFeedback(null);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    window.addEventListener('blur', clear);
    motion.addEventListener('change', clear);
    return () => {
      window.removeEventListener('blur', clear);
      motion.removeEventListener('change', clear);
    };
  }, []);

  useLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        isTypingTarget(event.target) ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        document.querySelector('[role="dialog"]')
      )
        return;
      if (event.target instanceof Element && event.target.closest('[data-demo-card]')) return;
      const direction = directionByKey[event.key];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  return {
    state,
    directionFeedback,
    clearDirectionFeedback,
    move,
    undo: () => dispatch({ type: 'undo' }),
    continueGame: () => dispatch({ type: 'continue' }),
    newGame: () => dispatch({ type: 'new-game', rolls: sampleRolls() }),
  };
}
