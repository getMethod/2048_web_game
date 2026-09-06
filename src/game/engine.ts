import type {
  Board,
  CellValue,
  Direction,
  MoveResult,
  RandomSource,
  Position,
  SpawnResult,
  TilePath,
  TileMerge,
} from './types';

export const BOARD_SIZE = 4;
export const WINNING_VALUE = 2048;

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array<CellValue>(BOARD_SIZE).fill(0));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function spawnRandomTile(board: Board, random: RandomSource = Math.random): SpawnResult {
  const emptyCells: Array<[number, number]> = [];

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      if ((board[row]?.[column] ?? 0) === 0) {
        emptyCells.push([row, column]);
      }
    }
  }

  if (emptyCells.length === 0) {
    return { board: cloneBoard(board), tile: null };
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

  return {
    board: nextBoard,
    tile: position ? { position: { row: position[0], column: position[1] }, value } : null,
  };
}

export function addRandomTile(board: Board, random: RandomSource = Math.random): Board {
  return spawnRandomTile(board, random).board;
}

export function createInitialBoard(random: RandomSource = Math.random): Board {
  return addRandomTile(addRandomTile(createEmptyBoard(), random), random);
}

function positionAt(line: number, offset: number, direction: Direction): Position {
  switch (direction) {
    case 'left':
      return { row: line, column: offset };
    case 'right':
      return { row: line, column: BOARD_SIZE - 1 - offset };
    case 'up':
      return { row: offset, column: line };
    case 'down':
      return { row: BOARD_SIZE - 1 - offset, column: line };
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
  const paths: TilePath[] = [];
  const merges: TileMerge[] = [];
  for (let line = 0; line < BOARD_SIZE; line += 1) {
    const sources = Array.from({ length: BOARD_SIZE }, (_, offset) => {
      const from = positionAt(line, offset, direction);
      return { from, value: board[from.row]?.[from.column] ?? 0, id: `${from.row}-${from.column}` };
    }).filter((tile) => tile.value !== 0);
    let target = 0;
    for (let index = 0; index < sources.length; index += 1) {
      const source = sources[index];
      if (!source) continue;
      const next = sources[index + 1];
      const merged = next?.value === source.value;
      const to = positionAt(line, target++, direction);
      paths.push({ ...source, to, merged });
      const value = merged ? source.value * 2 : source.value;
      const row = nextBoard[to.row];
      if (row) row[to.column] = value;
      if (merged && next) {
        paths.push({ ...next, to, merged: true });
        merges.push({ position: to, value, sourceIds: [source.id, next.id] });
        scoreGained += value;
        index += 1;
      }
    }
  }
  return { board: nextBoard, scoreGained, moved: !boardsEqual(board, nextBoard), paths, merges };
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
