export type Direction = 'up' | 'down' | 'left' | 'right';
export type CellValue = 0 | number;
export type Board = CellValue[][];
export type GameStatus = 'playing' | 'won' | 'continued' | 'lost';
export type RandomSource = () => number;

export interface GameSnapshot {
  board: Board;
  score: number;
}

export interface GameState extends GameSnapshot {
  bestScore: number;
  previous: GameSnapshot | null;
  status: GameStatus;
}

export interface MoveResult {
  board: Board;
  scoreGained: number;
  moved: boolean;
}

export type GameAction =
  | { type: 'move'; direction: Direction; random: RandomSource }
  | { type: 'undo' }
  | { type: 'continue' }
  | { type: 'new-game'; random: RandomSource };
