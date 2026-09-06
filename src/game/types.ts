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
  paths: TilePath[];
  merges: TileMerge[];
}

export interface Position {
  row: number;
  column: number;
}
export interface TilePath {
  id: string;
  value: number;
  from: Position;
  to: Position;
  merged: boolean;
}
export interface TileMerge {
  position: Position;
  value: number;
  sourceIds: [string, string];
}
export interface SpawnedTile {
  position: Position;
  value: number;
}
export interface SpawnResult {
  board: Board;
  tile: SpawnedTile | null;
}
export interface MovePresentation {
  id: number;
  paths: TilePath[];
  merges: TileMerge[];
  spawned: SpawnedTile | null;
  scoreGained: number;
}
export interface GameSession extends GameState {
  revision: number;
  presentation: MovePresentation | null;
  recordBaseline: number;
  recordCelebrated: boolean;
  recordEvent: number | null;
}
export type RandomRolls = readonly [number, number, number, number];
export type GameAction =
  | { type: 'move'; direction: Direction; rolls: RandomRolls }
  | { type: 'undo' }
  | { type: 'continue' }
  | { type: 'new-game'; rolls: RandomRolls };
