import type { Board } from '../game/types';
import styles from './Game.module.css';

interface GameBoardProps {
  board: Board;
}

export function GameBoard({ board }: GameBoardProps) {
  return (
    <div className={styles.boardFrame}>
      <div className={styles.board} role="grid" aria-label="2048 游戏棋盘" aria-rowcount={4}>
        {board.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <div
              className={styles.cell}
              data-value={value || undefined}
              role="gridcell"
              aria-label={`第 ${rowIndex + 1} 行，第 ${columnIndex + 1} 列，${value || '空格'}`}
              key={`${rowIndex}-${columnIndex}`}
            >
              {value || ''}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
