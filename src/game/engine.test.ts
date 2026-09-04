import { describe, expect, it } from 'vitest';
import {
  addRandomTile,
  canMove,
  createEmptyBoard,
  createInitialBoard,
  hasWinningTile,
  moveBoard,
} from './engine';
import type { Board } from './types';

describe('2048 游戏引擎', () => {
  it('初始化时生成两个方块', () => {
    const board = createInitialBoard(() => 0);
    expect(board.flat().filter(Boolean)).toEqual([2, 2]);
  });

  it('按 90%/10% 规则生成 2 或 4', () => {
    const rolls = [0, 0.89];
    const boardWithTwo = addRandomTile(createEmptyBoard(), () => rolls.shift() ?? 0);
    expect(boardWithTwo[0]?.[0]).toBe(2);

    const fourRolls = [0, 0.95];
    const boardWithFour = addRandomTile(createEmptyBoard(), () => fourRolls.shift() ?? 0);
    expect(boardWithFour[0]?.[0]).toBe(4);
  });

  it('连续压缩并保证每个方块单次最多合并一次', () => {
    const board: Board = [
      [2, 2, 2, 2],
      [2, 2, 4, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const result = moveBoard(board, 'left');
    expect(result.board[0]).toEqual([4, 4, 0, 0]);
    expect(result.board[1]).toEqual([4, 4, 0, 0]);
    expect(result.scoreGained).toBe(12);
    expect(result.moved).toBe(true);
  });

  it('正确处理四个方向', () => {
    const board: Board = [
      [2, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 2],
    ];

    expect(moveBoard(board, 'right').board[0]).toEqual([0, 0, 0, 4]);
    expect(moveBoard(board, 'left').board[3]).toEqual([4, 0, 0, 0]);
    expect(moveBoard(board, 'up').board[0]).toEqual([4, 0, 0, 4]);
    expect(moveBoard(board, 'down').board[3]).toEqual([4, 0, 0, 4]);
  });

  it('识别无法继续的棋盘和胜利方块', () => {
    const lostBoard: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    const winningBoard: Board = [
      [2048, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    expect(canMove(lostBoard)).toBe(false);
    expect(hasWinningTile(winningBoard)).toBe(true);
  });
});
