import { Header } from '../components/Header';
import { GameSection } from '../sections/GameSection';
import { HeroSection } from '../sections/HeroSection';
import { HowToPlay } from '../sections/HowToPlay';
import { Introduction } from '../sections/Introduction';
import { useTheme } from '../theme/useTheme';
import styles from './App.module.css';

export function App() {
  const theme = useTheme();

  return (
    <div className={styles.appShell}>
      <a className={styles.skipLink} href="#game">
        跳到游戏
      </a>
      <div className={styles.gridBackdrop} aria-hidden="true" />
      <Header theme={theme} />
      <main>
        <HeroSection />
        <Introduction />
        <HowToPlay />
        <GameSection />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>2048 数字挑战</span>
          <span>所有进度仅保存在当前浏览器</span>
        </div>
      </footer>
    </div>
  );
}
