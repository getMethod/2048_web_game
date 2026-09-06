import type { CSSProperties, ReactElement } from 'react';
import type { Board, MovePresentation, Position } from '../game/types';
import styles from './Game.module.css';

interface GameBoardProps {
  board: Board;
  presentation: MovePresentation | null;
}
interface TileStyle extends CSSProperties {
  '--row': number;
  '--column': number;
  '--from-row': number;
  '--from-column': number;
}
function tileStyle(to: Position, from: Position = to): TileStyle {
  return {
    '--row': to.row,
    '--column': to.column,
    '--from-row': from.row,
    '--from-column': from.column,
  };
}
export function GameBoard({ board, presentation }: GameBoardProps): ReactElement {
  const tiles: ReactElement[] = [];
  if (presentation) {
    for (const path of presentation.paths) {
      const moving = path.from.row !== path.to.row || path.from.column !== path.to.column;
      tiles.push(
        <div
          key={path.id}
          className={`${styles.cell} ${styles.tile} ${moving ? styles.sliding : ''} ${path.merged ? styles.mergeSource : ''}`}
          data-value={path.value}
          data-path={path.id}
          data-moving={moving}
          style={tileStyle(path.to, path.from)}
        >
          {path.value}
        </div>,
      );
    }
    for (const merge of presentation.merges) {
      tiles.push(
        <div
          key={`merge-${merge.position.row}-${merge.position.column}`}
          className={`${styles.cell} ${styles.tile} ${styles.mergedTile}`}
          data-value={merge.value}
          data-feedback="merge"
          style={tileStyle(merge.position)}
        >
          {merge.value}
        </div>,
      );
    }
    const spawned = presentation.spawned;
    if (spawned)
      tiles.push(
        <div
          key="spawn"
          className={`${styles.cell} ${styles.tile} ${styles.bornTile}`}
          data-value={spawned.value}
          data-feedback="birth"
          style={tileStyle(spawned.position)}
        >
          {spawned.value}
        </div>,
      );
  } else {
    board.forEach((row, rowIndex) =>
      row.forEach((value, column) => {
        if (value)
          tiles.push(
            <div
              key={`${rowIndex}-${column}`}
              className={`${styles.cell} ${styles.tile}`}
              data-value={value}
              style={tileStyle({ row: rowIndex, column })}
            >
              {value}
            </div>,
          );
      }),
    );
  }
  return (
    <div className={styles.boardFrame}>
      <div
        className={styles.boardSurface}
        data-testid="board-surface"
        data-animating={Boolean(presentation)}
      >
        <div
          className={styles.board}
          role="grid"
          aria-label="2048 游戏棋盘"
          aria-rowcount={4}
          aria-colcount={4}
        >
          {board.map((row, rowIndex) => (
            <div role="row" className={styles.boardRow} key={rowIndex}>
              {row.map((value, column) => (
                <div
                  className={styles.cell}
                  role="gridcell"
                  key={column}
                  aria-label={`第 ${rowIndex + 1} 行，第 ${column + 1} 列，${value || '空格'}`}
                >
                  <span className="visually-hidden">{value || '空格'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.tileLayer} aria-hidden="true" key={presentation?.id ?? 'settled'}>
          {tiles}
        </div>
      </div>
    </div>
  );
}
