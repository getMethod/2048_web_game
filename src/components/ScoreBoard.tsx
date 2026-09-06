import type { ReactElement } from 'react';
import type { GameSession } from '../game/types';
import { useTimedFeedback } from './useTimedFeedback';
import styles from './Game.module.css';

interface ScoreBoardProps {
  state: GameSession;
}
export function ScoreBoard({ state }: ScoreBoardProps): ReactElement {
  const gain = state.presentation?.scoreGained ?? 0;
  const gainId = gain > 0 ? (state.presentation?.id ?? null) : null;
  const showGain = useTimedFeedback(gainId, '--motion-score');
  const showRecord = useTimedFeedback(state.recordEvent, '--motion-record');
  return (
    <div className={styles.scoreBoard} aria-label="分数">
      <div className={styles.scoreCard}>
        <span>当前分数</span>
        <strong data-testid="current-score">{state.score}</strong>
        {showGain && (
          <b key={gainId} className={styles.scoreGain} data-testid="score-gain" aria-hidden="true">
            +{gain}
          </b>
        )}
      </div>
      <div className={styles.scoreCard}>
        <span>历史最高</span>
        <strong data-testid="best-score">{state.bestScore}</strong>
        <div className={styles.recordSlot} role="status" aria-live="polite">
          {showRecord && (
            <b key={state.recordEvent} className={styles.newRecord} data-testid="new-record">
              新纪录
            </b>
          )}
        </div>
      </div>
    </div>
  );
}
