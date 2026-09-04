import { useCallback, useEffect, useReducer } from 'react';
import { addRandomTile, canMove, createInitialBoard, hasWinningTile, moveBoard } from './engine';
import { loadBestScore, loadGameState, saveBestScore, saveGameState } from './storage';
import type { Direction, GameAction, GameState, RandomSource } from './types';

export function createGameState(random: RandomSource = Math.random): GameState {
  const restored = loadGameState();
  const storedBest = loadBestScore();

  if (restored) {
    return { ...restored, bestScore: Math.max(restored.bestScore, storedBest, restored.score) };
  }

  return {
    board: createInitialBoard(random),
    score: 0,
    bestScore: storedBest,
    previous: null,
    status: 'playing',
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'move': {
      if (state.status === 'won' || state.status === 'lost') return state;
      const result = moveBoard(state.board, action.direction);
      if (!result.moved) return state;

      const board = addRandomTile(result.board, action.random);
      const score = state.score + result.scoreGained;
      let status: GameState['status'] = state.status;

      if (state.status === 'playing' && hasWinningTile(board)) status = 'won';
      else if (!canMove(board)) status = 'lost';

      return {
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
        board: previous.board,
        score: previous.score,
        previous: null,
        status: hasWinningTile(previous.board) ? 'continued' : 'playing',
      };
    }
    case 'continue':
      return state.status === 'won' ? { ...state, status: 'continued' } : state;
    case 'new-game':
      return {
        board: createInitialBoard(action.random),
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

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createGameState());

  useEffect(() => {
    saveGameState(state);
    saveBestScore(state.bestScore);
  }, [state]);

  const move = useCallback((direction: Direction) => {
    dispatch({ type: 'move', direction, random: Math.random });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
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
    move,
    undo: () => dispatch({ type: 'undo' }),
    continueGame: () => dispatch({ type: 'continue' }),
    newGame: () => dispatch({ type: 'new-game', random: Math.random }),
  };
}
