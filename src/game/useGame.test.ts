import { describe, expect, it } from 'vitest';
import { gameReducer } from './useGame';
import type { GameState } from './types';

const baseState: GameState = {
  board: [
    [2, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  score: 0,
  bestScore: 0,
  previous: null,
  status: 'playing',
};

describe('游戏状态转换', () => {
  it('有效移动计分、生成方块并保存撤销快照', () => {
    const next = gameReducer(baseState, { type: 'move', direction: 'left', random: () => 0 });
    expect(next.score).toBe(4);
    expect(next.bestScore).toBe(4);
    expect(next.previous).toEqual({ board: baseState.board, score: 0 });
    expect(next.board.flat().filter(Boolean)).toHaveLength(2);
  });

  it('无效移动不改变状态引用或撤销快照', () => {
    const state: GameState = {
      ...baseState,
      board: [
        [2, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    };
    const next = gameReducer(state, { type: 'move', direction: 'left', random: () => 0 });
    expect(next).toBe(state);
  });

  it('单步撤销后清空撤销快照且保留最高分', () => {
    const moved = gameReducer(baseState, { type: 'move', direction: 'left', random: () => 0 });
    const undone = gameReducer(moved, { type: 'undo' });
    expect(undone.board).toEqual(baseState.board);
    expect(undone.score).toBe(0);
    expect(undone.bestScore).toBe(4);
    expect(undone.previous).toBeNull();
  });
});
