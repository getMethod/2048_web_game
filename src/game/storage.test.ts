import { beforeEach, describe, expect, it } from 'vitest';
import {
  BEST_SCORE_STORAGE_KEY,
  GAME_STORAGE_KEY,
  loadBestScore,
  loadGameState,
  parseGameState,
  saveBestScore,
  saveGameState,
} from './storage';
import type { GameState } from './types';

const validState: GameState = {
  board: [
    [2, 4, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  score: 16,
  bestScore: 64,
  previous: null,
  status: 'playing',
};

describe('游戏存储', () => {
  beforeEach(() => window.localStorage.clear());

  it('保存并恢复合法棋局', () => {
    saveGameState(validState);
    expect(loadGameState()).toEqual(validState);
  });

  it('拒绝尺寸或数值非法的棋盘', () => {
    expect(parseGameState({ ...validState, board: [[2]] })).toBeNull();
    expect(
      parseGameState({
        ...validState,
        board: [
          [3, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
      }),
    ).toBeNull();
  });

  it('损坏 JSON 自动回退', () => {
    window.localStorage.setItem(GAME_STORAGE_KEY, '{invalid');
    expect(loadGameState()).toBeNull();
  });

  it('保存并读取最高分', () => {
    saveBestScore(256);
    expect(loadBestScore()).toBe(256);
    window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, '-1');
    expect(loadBestScore()).toBe(0);
  });
});
