import { useCallback, useRef, useState } from 'react';
import { useReducedMotion } from '../components/useReducedMotion';
import { useTimedFeedback } from '../components/useTimedFeedback';
import { useSectionReveal } from './useSectionReveal';
import { GameBoard } from '../components/GameBoard';
import { GameDialog } from '../components/GameDialog';
import { ScoreBoard } from '../components/ScoreBoard';
import { useGame } from '../game/useGame';
import type { Direction } from '../game/types';
import styles from '../components/Game.module.css';

export function GameSection() {
  const { state, directionFeedback, clearDirectionFeedback, move, undo, continueGame, newGame } =
    useGame();
  const sectionRef = useSectionReveal();
  const reduced = useReducedMotion();
  const animating = useTimedFeedback(
    state.presentation?.id ?? null,
    '--motion-board-total',
    reduced,
  );
  const showDirectionFeedback = useTimedFeedback(
    directionFeedback?.id ?? null,
    '--motion-control',
    reduced,
  );
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [undoEvent, setUndoEvent] = useState<number | null>(null);
  const undoSequence = useRef(0);
  const showUndoFeedback = useTimedFeedback(undoEvent, '--motion-undo');

  const closeRestart = useCallback(() => setConfirmRestart(false), []);

  const restart = () => {
    newGame();
    setUndoEvent(null);
    setConfirmRestart(false);
  };

  const handleUndo = () => {
    if (!state.previous) return;
    undo();
    undoSequence.current += 1;
    setUndoEvent(undoSequence.current);
  };

  const directionButton = (direction: Direction, label: string, symbol: string) => {
    const feedbackId =
      showDirectionFeedback && directionFeedback?.direction === direction
        ? directionFeedback.id
        : null;
    return (
      <button
        className={feedbackId ? styles.directionPressed : undefined}
        data-direction={direction}
        data-pressed={feedbackId ? 'true' : undefined}
        key={`${direction}-${feedbackId ?? 'idle'}`}
        type="button"
        aria-label={label}
        onClick={() => move(direction)}
        onAnimationEnd={(event) => {
          if (feedbackId && event.currentTarget === event.target)
            clearDirectionFeedback(feedbackId);
        }}
      >
        {symbol}
      </button>
    );
  };

  return (
    <section
      ref={sectionRef}
      className={styles.gameSection}
      id="game"
      tabIndex={-1}
      aria-labelledby="game-title"
    >
      <div className={styles.gameHeading} data-reveal-item="heading">
        <span>READY TO PLAY</span>
        <h2 id="game-title">开始挑战</h2>
        <p>使用键盘方向键或 W/A/S/D 移动方块。</p>
      </div>
      <div className={styles.gameLayout}>
        <div className={styles.gamePanel} data-reveal-item="1">
          <GameBoard board={state.board} presentation={animating ? state.presentation : null} />
        </div>
        <aside data-reveal-item="2" className={styles.controlsPanel} aria-label="游戏控制">
          <ScoreBoard state={state} />
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
            {directionButton('up', '向上移动', '↑')}
            <div>
              {directionButton('left', '向左移动', '←')}
              {directionButton('down', '向下移动', '↓')}
              {directionButton('right', '向右移动', '→')}
            </div>
          </div>
          <div className={styles.controlFeedback} role="status" aria-live="polite">
            {showUndoFeedback ? (
              <span className={styles.undoFeedback} data-testid="undo-feedback">
                ✓ 已撤销
              </span>
            ) : null}
          </div>
          <div className={styles.controlActions}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={handleUndo}
              disabled={!state.previous}
            >
              ↶ 单步撤销
            </button>
            <button
              className={styles.dangerButton}
              type="button"
              onClick={(event) => {
                // WebKit 鼠标点击按钮不一定聚焦，明确记录对话框返回位置。
                event.currentTarget.focus({ preventScroll: true });
                setConfirmRestart(true);
              }}
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
        onClose={closeRestart}
      />
      <GameDialog
        open={state.status === 'won' && !animating && !confirmRestart}
        title="达成 2048！"
        message="漂亮的一局。你可以继续合并更大的数字，或者开始新的挑战。"
        primaryLabel="继续游戏"
        onPrimary={continueGame}
        secondaryLabel="重新开始"
        onSecondary={restart}
      />
      <GameDialog
        open={state.status === 'lost' && !animating && !confirmRestart}
        title="游戏结束"
        message="棋盘已经没有可移动空间，再来一局刷新最高分吧。"
        primaryLabel="再来一局"
        onPrimary={restart}
      />
    </section>
  );
}
