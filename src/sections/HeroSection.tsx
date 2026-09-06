import { useAmbientMotion } from './useAmbientMotion';
import styles from './Sections.module.css';

export function HeroSection() {
  const visualRef = useAmbientMotion();

  return (
    <section className={`${styles.section} ${styles.hero}`} id="top" aria-labelledby="hero-title">
      <div className={styles.heroContent}>
        <div className={styles.eyebrow}>
          <span className={styles.statusDot} aria-hidden="true" />
          经典数字合并游戏
        </div>
        <h1 id="hero-title">
          <span>2048</span>
          数字挑战
        </h1>
        <p>合并数字，挑战你的最高分</p>
        <a className={styles.primaryCta} href="#game">
          立即开始
          <span aria-hidden="true">↓</span>
        </a>
        <div className={styles.keyHint} aria-label="可使用方向键或 WASD 操作">
          <span>方向键</span>
          <kbd>↑</kbd>
          <kbd>←</kbd>
          <kbd>↓</kbd>
          <kbd>→</kbd>
          <span>或 WASD</span>
        </div>
      </div>
      <div ref={visualRef} className={styles.heroVisual} aria-hidden="true">
        <div className={styles.orbit} />
        <div className={styles.heroTile}>2048</div>
        <div className={`${styles.floatingTile} ${styles.tileOne}`}>2</div>
        <div className={`${styles.floatingTile} ${styles.tileTwo}`}>4</div>
        <div className={`${styles.floatingTile} ${styles.tileThree}`}>8</div>
        <div className={`${styles.floatingTile} ${styles.tileFour}`}>16</div>
      </div>
    </section>
  );
}
