import { describe, expect, it } from 'vitest';
import {
  addRandomTile,
  canMove,
  createEmptyBoard,
  createInitialBoard,
  hasWinningTile,
  moveBoard,
  spawnRandomTile,
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

describe('移动呈现数据', () => {
  it.each([
    [
      'left',
      [
        [0, 0],
        [3, 0],
      ],
    ],
    [
      'right',
      [
        [0, 3],
        [3, 3],
      ],
    ],
    [
      'up',
      [
        [0, 0],
        [0, 3],
      ],
    ],
    [
      'down',
      [
        [3, 0],
        [3, 3],
      ],
    ],
  ] as const)('%s 给出真实来源、目标及两组合并', (direction, targets) => {
    const board = [
      [2, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 2],
    ];
    const result = moveBoard(board, direction);
    expect(result.paths).toHaveLength(4);
    expect(new Set(result.paths.map((path) => path.id)).size).toBe(4);
    expect(result.merges.map((merge) => [merge.position.row, merge.position.column])).toEqual(
      targets,
    );
    for (const merge of result.merges) {
      const sources = result.paths.filter((path) => merge.sourceIds.includes(path.id));
      expect(sources).toHaveLength(2);
      expect(
        sources.every(
          (path) =>
            path.merged &&
            path.to.row === merge.position.row &&
            path.to.column === merge.position.column,
        ),
      ).toBe(true);
      expect(sources.reduce((sum, path) => sum + path.value, 0)).toBe(merge.value);
    }
    for (const path of result.paths)
      expect(board[path.from.row]?.[path.from.column]).toBe(path.value);
    expect(board).toEqual([
      [2, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 2],
    ]);
  });
  it('多组合并、未移动块和单次合并限制的路径准确', () => {
    const result = moveBoard(
      [
        [2, 2, 2, 2],
        [2, 2, 4, 0],
        [8, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      'left',
    );
    expect(result.merges.map((merge) => merge.value)).toEqual([4, 4, 4]);
    expect(result.paths.find((path) => path.id === '1-2')).toEqual({
      id: '1-2',
      value: 4,
      from: { row: 1, column: 2 },
      to: { row: 1, column: 1 },
      merged: false,
    });
    expect(result.paths.find((path) => path.id === '2-0')).toEqual({
      id: '2-0',
      value: 8,
      from: { row: 2, column: 0 },
      to: { row: 2, column: 0 },
      merged: false,
    });
    expect(result.board[1]).toEqual([4, 4, 0, 0]);
  });
  it('出生坐标、数值和棋盘一致且仅使用两次采样', () => {
    const rolls = [0.999, 0.95];
    const source = createEmptyBoard();
    const result = spawnRandomTile(source, () => rolls.shift() ?? 0);
    expect(result.tile).toEqual({ position: { row: 3, column: 3 }, value: 4 });
    expect(result.board[3]?.[3]).toBe(4);
    expect(source.flat().every((value) => value === 0)).toBe(true);
    expect(rolls).toHaveLength(0);
    const full = Array.from({ length: 4 }, () => [2, 4, 2, 4]);
    expect(
      spawnRandomTile(full, () => {
        throw new Error('满盘不得采样');
      }).tile,
    ).toBeNull();
  });
});
