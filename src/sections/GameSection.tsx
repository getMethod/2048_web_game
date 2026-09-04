import { useState } from 'react';
import { GameBoard } from '../components/GameBoard';
import { GameDialog } from '../components/GameDialog';
import { ScoreBoard } from '../components/ScoreBoard';
import { useGame } from '../game/useGame';
import styles from '../components/Game.module.css';

export function GameSection() {
  const { state, move, undo, continueGame, newGame } = useGame();
  const [confirmRestart, setConfirmRestart] = useState(false);

  const restart = () => {
    newGame();
    setConfirmRestart(false);
  };

  return (
    <section className={styles.gameSection} id="game" tabIndex={-1} aria-labelledby="game-title">
      <div className={styles.gameHeading}>
        <span>READY TO PLAY</span>
        <h2 id="game-title">开始挑战</h2>
        <p>使用键盘方向键或 W/A/S/D 移动方块。</p>
      </div>
      <div className={styles.gameLayout}>
        <div className={styles.gamePanel}>
          <GameBoard board={state.board} />
        </div>
        <aside className={styles.controlsPanel} aria-label="游戏控制">
          <ScoreBoard score={state.score} bestScore={state.bestScore} />
          <div className={styles.statusPanel}>
            <span className={styles.statusLabel}>当前状态</span>
            <strong>
              {state.status === 'continued'
                ? '继续挑战'
                : state.status === 'lost'
                  ? '游戏结束'
                  : state.status === 'won'
                    ? '达成 2048'
                    : '进行中'}
            </strong>
            <p>每次有效移动后，会自动保存棋局。</p>
          </div>
          <div className={styles.directionPad} aria-label="方向控制">
            <button type="button" aria-label="向上移动" onClick={() => move('up')}>
              ↑
            </button>
            <div>
              <button type="button" aria-label="向左移动" onClick={() => move('left')}>
                ←
              </button>
              <button type="button" aria-label="向下移动" onClick={() => move('down')}>
                ↓
              </button>
              <button type="button" aria-label="向右移动" onClick={() => move('right')}>
                →
              </button>
            </div>
          </div>
          <div className={styles.controlActions}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={undo}
              disabled={!state.previous}
            >
              ↶ 单步撤销
            </button>
            <button
              className={styles.dangerButton}
              type="button"
              onClick={() => setConfirmRestart(true)}
            >
              重新开始
            </button>
          </div>
        </aside>
      </div>

      <GameDialog
        open={confirmRestart}
        title="重新开始？"
        message="当前棋局会被清空，历史最高分将会保留。"
        primaryLabel="确认重开"
        onPrimary={restart}
        onClose={() => setConfirmRestart(false)}
      />
      <GameDialog
        open={state.status === 'won'}
        title="达成 2048！"
        message="漂亮的一局。你可以继续合并更大的数字，或者开始新的挑战。"
        primaryLabel="继续游戏"
        onPrimary={continueGame}
        secondaryLabel="重新开始"
        onSecondary={restart}
      />
      <GameDialog
        open={state.status === 'lost'}
        title="游戏结束"
        message="棋盘已经没有可移动空间，再来一局刷新最高分吧。"
        primaryLabel="再来一局"
        onPrimary={restart}
      />
    </section>
  );
}
