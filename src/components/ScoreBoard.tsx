import styles from './Game.module.css';

interface ScoreBoardProps {
  score: number;
  bestScore: number;
}

export function ScoreBoard({ score, bestScore }: ScoreBoardProps) {
  return (
    <div className={styles.scoreBoard} aria-label="分数">
      <div className={styles.scoreCard}>
        <span>当前分数</span>
        <strong data-testid="current-score">{score}</strong>
      </div>
      <div className={styles.scoreCard}>
        <span>历史最高</span>
        <strong data-testid="best-score">{bestScore}</strong>
      </div>
    </div>
  );
}
