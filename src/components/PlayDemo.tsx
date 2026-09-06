import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { motionDuration } from './useTimedFeedback';
import styles from './PlayDemo.module.css';

type DemoKind = 'move' | 'merge' | 'win';
interface PlayDemoProps {
  kind: DemoKind;
  title: string;
}
export function PlayDemo({ kind, title }: PlayDemoProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return;
    let seen = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible && !seen) {
          seen = true;
          if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden) {
            setRun((value) => value + 1);
            setPlaying(true);
          }
        } else if (!visible) setPlaying(false);
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    const stop = () => {
      if (document.hidden) setPlaying(false);
    };
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => {
      if (media.matches) setPlaying(false);
    };
    document.addEventListener('visibilitychange', stop);
    media.addEventListener('change', onMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', stop);
      media.removeEventListener('change', onMotion);
    };
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timeout = window.setTimeout(() => setPlaying(false), motionDuration('--motion-demo'));
    return () => window.clearTimeout(timeout);
  }, [playing, run]);
  const active = playing && !reduced;
  return (
    <div ref={ref} className={styles.demo} data-demo={kind} data-playing={active} data-run={run}>
      <div
        key={run}
        className={`${styles.stage} ${active ? styles.playing : ''}`}
        aria-hidden="true"
      >
        {kind === 'move' && (
          <>
            <div className={styles.keys}>
              <kbd>↑</kbd>
              <div>
                <kbd className={styles.activeKey}>←</kbd>
                <kbd>↓</kbd>
                <kbd>→</kbd>
              </div>
            </div>
            <div className={styles.miniBoard}>
              <i />
              <i />
              <i />
              <i />
              <b className={styles.moveTile}>2</b>
            </div>
          </>
        )}
        {kind === 'merge' && (
          <>
            <div className={styles.formula}>
              <b>2</b>
              <span>+</span>
              <b>2</b>
              <span>→</span>
              <b>4</b>
            </div>
            {active && (
              <div className={styles.mergeScene}>
                <b className={styles.mergeLeft}>2</b>
                <b className={styles.mergeRight}>2</b>
                <b className={styles.mergeResult}>4</b>
              </div>
            )}
          </>
        )}
        {kind === 'win' && <b className={styles.winTile}>2048</b>}
      </div>
      <span className="visually-hidden">
        {kind === 'move'
          ? '按左方向键，方块向左移动。'
          : kind === 'merge'
            ? '2 + 2 → 4'
            : '合成 2048，达成目标。'}
      </span>
      <button
        className={styles.replay}
        type="button"
        aria-label={`重播${title}演示`}
        onClick={() => {
          if (!reduced) {
            setRun((value) => value + 1);
            setPlaying(true);
          }
        }}
      >
        ↻ 重播演示
      </button>
    </div>
  );
}
