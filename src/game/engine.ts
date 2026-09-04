import type { Board, CellValue, Direction, MoveResult, RandomSource } from './types';

export const BOARD_SIZE = 4;
export const WINNING_VALUE = 2048;

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array<CellValue>(BOARD_SIZE).fill(0));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function addRandomTile(board: Board, random: RandomSource = Math.random): Board {
  const emptyCells: Array<[number, number]> = [];

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      if ((board[row]?.[column] ?? 0) === 0) {
        emptyCells.push([row, column]);
      }
    }
  }

  if (emptyCells.length === 0) {
    return cloneBoard(board);
  }

  const positionRoll = Math.min(Math.max(random(), 0), 0.999999999);
  const position = emptyCells[Math.floor(positionRoll * emptyCells.length)];
  const value: CellValue = random() < 0.9 ? 2 : 4;
  const nextBoard = cloneBoard(board);

  if (position) {
    const [row, column] = position;
    const targetRow = nextBoard[row];
    if (targetRow) targetRow[column] = value;
  }

  return nextBoard;
}

export function createInitialBoard(random: RandomSource = Math.random): Board {
  return addRandomTile(addRandomTile(createEmptyBoard(), random), random);
}

function mergeLine(line: CellValue[]): { line: CellValue[]; scoreGained: number } {
  const compacted = line.filter((value) => value !== 0);
  const merged: CellValue[] = [];
  let scoreGained = 0;

  for (let index = 0; index < compacted.length; index += 1) {
    const current = compacted[index] ?? 0;
    const next = compacted[index + 1] ?? 0;

    if (current !== 0 && current === next) {
      const combined = current * 2;
      merged.push(combined);
      scoreGained += combined;
      index += 1;
    } else {
      merged.push(current);
    }
  }

  while (merged.length < BOARD_SIZE) merged.push(0);
  return { line: merged, scoreGained };
}

function readLine(board: Board, index: number, direction: Direction): CellValue[] {
  switch (direction) {
    case 'left':
      return Array.from({ length: BOARD_SIZE }, (_, column) => board[index]?.[column] ?? 0);
    case 'right':
      return Array.from(
        { length: BOARD_SIZE },
        (_, column) => board[index]?.[BOARD_SIZE - 1 - column] ?? 0,
      );
    case 'up':
      return Array.from({ length: BOARD_SIZE }, (_, row) => board[row]?.[index] ?? 0);
    case 'down':
      return Array.from(
        { length: BOARD_SIZE },
        (_, row) => board[BOARD_SIZE - 1 - row]?.[index] ?? 0,
      );
  }
}

function writeLine(board: Board, index: number, direction: Direction, line: CellValue[]) {
  for (let position = 0; position < BOARD_SIZE; position += 1) {
    const value = line[position] ?? 0;
    let row = index;
    let column = position;

    if (direction === 'right') column = BOARD_SIZE - 1 - position;
    if (direction === 'up') {
      row = position;
      column = index;
    }
    if (direction === 'down') {
      row = BOARD_SIZE - 1 - position;
      column = index;
    }

    const targetRow = board[row];
    if (targetRow) targetRow[column] = value;
  }
}

function boardsEqual(first: Board, second: Board): boolean {
  return first.every((row, rowIndex) =>
    row.every((value, columnIndex) => value === (second[rowIndex]?.[columnIndex] ?? 0)),
  );
}

export function moveBoard(board: Board, direction: Direction): MoveResult {
  const nextBoard = createEmptyBoard();
  let scoreGained = 0;

  for (let index = 0; index < BOARD_SIZE; index += 1) {
    const result = mergeLine(readLine(board, index, direction));
    writeLine(nextBoard, index, direction, result.line);
    scoreGained += result.scoreGained;
  }

  return {
    board: nextBoard,
    scoreGained,
    moved: !boardsEqual(board, nextBoard),
  };
}

export function hasWinningTile(board: Board): boolean {
  return board.some((row) => row.some((value) => value >= WINNING_VALUE));
}

export function canMove(board: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const value = board[row]?.[column] ?? 0;
      if (value === 0) return true;
      if (column + 1 < BOARD_SIZE && value === board[row]?.[column + 1]) return true;
      if (row + 1 < BOARD_SIZE && value === board[row + 1]?.[column]) return true;
    }
  }

  return false;
}
