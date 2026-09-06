import type { Board, GameSnapshot, GameState, GameStatus } from './types';

export const GAME_STORAGE_KEY = 'jy-2048:game:v1';
export const BEST_SCORE_STORAGE_KEY = 'jy-2048:best-score:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTileValue(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    (value === 0 || (value & (value - 1)) === 0)
  );
}

export function isValidBoard(value: unknown): value is Board {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every(
      (row) => Array.isArray(row) && row.length === 4 && row.every((cell) => isTileValue(cell)),
    )
  );
}

function isValidScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isValidStatus(value: unknown): value is GameStatus {
  return value === 'playing' || value === 'won' || value === 'continued' || value === 'lost';
}

function isValidSnapshot(value: unknown): value is GameSnapshot {
  return isRecord(value) && isValidBoard(value.board) && isValidScore(value.score);
}

export function parseGameState(value: unknown): GameState | null {
  if (!isRecord(value)) return null;
  if (!isValidBoard(value.board) || !isValidScore(value.score)) return null;
  if (!isValidScore(value.bestScore) || !isValidStatus(value.status)) return null;
  if (value.previous !== null && !isValidSnapshot(value.previous)) return null;

  return {
    board: value.board,
    score: value.score,
    bestScore: Math.max(value.bestScore, value.score),
    previous: value.previous,
    status: value.status,
  };
}

export function loadGameState(): GameState | null {
  try {
    const raw = window.localStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) return null;
    return parseGameState(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState) {
  try {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({
        board: state.board,
        score: state.score,
        bestScore: state.bestScore,
        previous: state.previous,
        status: state.status,
      }),
    );
  } catch {
    // 存储异常不应阻断当前棋局。
  }
}

export function loadBestScore(): number {
  try {
    const value = Number(window.localStorage.getItem(BEST_SCORE_STORAGE_KEY));
    return isValidScore(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score: number) {
  try {
    window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(score));
  } catch {
    // 存储异常不应阻断计分。
  }
}
