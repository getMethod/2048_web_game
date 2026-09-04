import styles from './Sections.module.css';

export function HowToPlay() {
  return (
    <section
      className={`${styles.section} ${styles.contentSection}`}
      id="how-to-play"
      aria-labelledby="how-to-play-title"
    >
      <div className={styles.sectionHeading}>
        <span>HOW TO PLAY</span>
        <h2 id="how-to-play-title">玩法说明</h2>
        <p>每一步都很简单，但想走得更远，需要为棋盘留出空间。</p>
      </div>
      <div className={styles.stepsGrid}>
        <article className={styles.stepCard}>
          <span className={styles.stepNumber}>01</span>
          <div className={styles.arrowKeys} aria-hidden="true">
            <kbd>↑</kbd>
            <div>
              <kbd>←</kbd>
              <kbd>↓</kbd>
              <kbd>→</kbd>
            </div>
          </div>
          <h3>移动方块</h3>
          <p>使用方向键或 W/A/S/D，让全部方块向同一方向滑动。</p>
        </article>
        <article className={styles.stepCard}>
          <span className={styles.stepNumber}>02</span>
          <div className={styles.mergeDemo} aria-label="2 加 2 等于 4">
            <span>2</span>
            <b>+</b>
            <span>2</span>
            <b>→</b>
            <span>4</span>
          </div>
          <h3>合并数字</h3>
          <p>两个相同数字相遇时会合并，并把新数字计入当前分数。</p>
        </article>
        <article className={styles.stepCard}>
          <span className={styles.stepNumber}>03</span>
          <div className={styles.goalTile}>2048</div>
          <h3>达成 2048</h3>
          <p>持续规划空间，合成 2048 后可以继续挑战更高数字。</p>
        </article>
      </div>
    </section>
  );
}
