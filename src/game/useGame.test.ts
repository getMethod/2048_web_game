import { describe, expect, it } from 'vitest';
import { gameReducer, createSession } from './useGame';
import type { GameSession, GameAction } from './types';

const baseState = createSession({
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
});

describe('游戏状态转换', () => {
  it('有效移动计分、生成方块并保存撤销快照', () => {
    const next = gameReducer(baseState, { type: 'move', direction: 'left', rolls: [0, 0, 0, 0] });
    expect(next.score).toBe(4);
    expect(next.bestScore).toBe(4);
    expect(next.previous).toEqual({ board: baseState.board, score: 0 });
    expect(next.board.flat().filter(Boolean)).toHaveLength(2);
  });

  it('无效移动不改变状态引用或撤销快照', () => {
    const state: GameSession = {
      ...baseState,
      board: [
        [2, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    };
    const next = gameReducer(state, { type: 'move', direction: 'left', rolls: [0, 0, 0, 0] });
    expect(next).toBe(state);
  });

  it('单步撤销后清空撤销快照且保留最高分', () => {
    const moved = gameReducer(baseState, { type: 'move', direction: 'left', rolls: [0, 0, 0, 0] });
    const undone = gameReducer(moved, { type: 'undo' });
    expect(undone.board).toEqual(baseState.board);
    expect(undone.score).toBe(0);
    expect(undone.bestScore).toBe(4);
    expect(undone.previous).toBeNull();
  });
});

describe('连续输入与临时反馈边界', () => {
  const left: GameAction = { type: 'move', direction: 'left', rolls: [0, 0, 0, 0] };
  it('相同输入可重复计算，且动画期间连续移动基于最新棋盘', () => {
    const initial = createSession({
      ...baseState,
      board: [
        [2, 2, 4, 4],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    });
    const first = gameReducer(initial, left);
    expect(gameReducer(initial, left)).toEqual(first);
    expect(first.board[0]).toEqual([4, 8, 2, 0]);
    expect(first.score).toBe(12);
    const second = gameReducer(first, { ...left, direction: 'right' });
    expect(second.board[0]).toEqual([2, 4, 8, 2]);
    expect(second.score).toBe(12);
    expect(second.presentation?.scoreGained).toBe(0);
    expect(second.presentation?.id).toBe(2);
    expect(second.previous?.board).toEqual(first.board);
    expect(gameReducer(second, left)).toBe(second);
  });
  it('纪录仅在首次严格突破时触发，撤销再次突破不重播', () => {
    const state = createSession({
      ...baseState,
      board: [
        [2, 2, 2, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      bestScore: 8,
    });
    const equal = gameReducer(state, left);
    expect(equal.recordEvent).toBeNull();
    const record = gameReducer(equal, left);
    expect(record.score).toBe(16);
    expect(record.recordEvent).toBe(record.revision);
    expect(record.recordCelebrated).toBe(true);
    const later = gameReducer(record, left);
    expect(later.score).toBe(20);
    expect(later.recordEvent).toBe(record.recordEvent);
    const undone = gameReducer(record, { type: 'undo' });
    expect(undone.presentation).toBeNull();
    expect(undone.recordEvent).toBeNull();
    const again = gameReducer(undone, left);
    expect(again.score).toBe(16);
    expect(again.recordEvent).toBeNull();
    const fresh = gameReducer(again, { type: 'new-game', rolls: [0, 0, 0, 0] });
    expect(fresh.recordBaseline).toBe(16);
    expect(fresh.recordCelebrated).toBe(false);
    expect(fresh.presentation).toBeNull();
  });
  it('恢复时采用最高分基准且不重播动画或纪录提示', () => {
    const restored = createSession({ ...baseState, score: 100, bestScore: 100 });
    expect(restored.recordBaseline).toBe(100);
    expect(restored.presentation).toBeNull();
    expect(restored.recordEvent).toBeNull();
  });
});
