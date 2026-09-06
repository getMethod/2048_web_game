import { PlayDemo } from '../components/PlayDemo';
import { useSectionReveal } from './useSectionReveal';
import styles from './Sections.module.css';

const steps = [
  {
    kind: 'move',
    title: '移动方块',
    description: '使用方向键或 W/A/S/D，让全部方块向同一方向滑动。',
  },
  {
    kind: 'merge',
    title: '合并数字',
    description: '两个相同数字相遇时会合并，并把新数字计入当前分数。',
  },
  {
    kind: 'win',
    title: '达成 2048',
    description: '持续规划空间，合成 2048 后可以继续挑战更高数字。',
  },
] as const;
export function HowToPlay() {
  const sectionRef = useSectionReveal();
  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${styles.contentSection}`}
      id="how-to-play"
      aria-labelledby="how-to-play-title"
    >
      <div className={styles.sectionHeading} data-reveal-item="heading">
        <span>HOW TO PLAY</span>
        <h2 id="how-to-play-title">玩法说明</h2>
        <p>每一步都很简单，但想走得更远，需要为棋盘留出空间。</p>
      </div>
      <div className={styles.stepsGrid}>
        {steps.map((step, index) => (
          <article
            className={styles.stepCard}
            data-demo-card
            data-reveal-item={index + 1}
            key={step.kind}
          >
            <span className={styles.stepNumber}>0{index + 1}</span>
            <PlayDemo kind={step.kind} title={step.title} />
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
