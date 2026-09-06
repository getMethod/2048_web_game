import { useSectionReveal } from './useSectionReveal';
import styles from './Sections.module.css';

const features = [
  { icon: '▦', title: '4×4 棋盘', detail: '简洁规则，丰富变化' },
  { icon: '↶', title: '单步撤销', detail: '给关键选择一次机会' },
  { icon: '⌁', title: '本地保存', detail: '刷新后继续当前棋局' },
];

export function Introduction() {
  const sectionRef = useSectionReveal();
  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${styles.contentSection}`}
      id="introduction"
      aria-labelledby="introduction-title"
    >
      <div className={styles.sectionHeading} data-reveal-item="heading">
        <span>ABOUT THE GAME</span>
        <h2 id="introduction-title">游戏介绍</h2>
        <p>2048 是一款经典数字合并游戏。移动并合并相同数字，挑战更高分数，最终达成 2048。</p>
      </div>
      <div className={styles.featureGrid}>
        {features.map((feature, index) => (
          <article data-reveal-item={index + 1} className={styles.featureCard} key={feature.title}>
            <span className={styles.featureIcon} aria-hidden="true">
              {feature.icon}
            </span>
            <div>
              <h3>{feature.title}</h3>
              <p>{feature.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
