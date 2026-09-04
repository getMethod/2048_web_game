import type { UseThemeResult } from '../theme/useTheme';
import { ThemeSwitch } from './ThemeSwitch';
import styles from './Header.module.css';

interface HeaderProps {
  theme: UseThemeResult;
}

export function Header({ theme }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a className={styles.brand} href="#top" aria-label="2048 数字挑战首页">
          <span className={styles.brandMark} aria-hidden="true">
            2ⁿ
          </span>
          <span>2048 数字挑战</span>
        </a>
        <nav className={styles.nav} aria-label="主要导航">
          <a href="#introduction">游戏介绍</a>
          <a href="#how-to-play">玩法说明</a>
          <a className={styles.gameLink} href="#game">
            开始游戏
          </a>
        </nav>
        <ThemeSwitch theme={theme.theme} onChange={theme.setTheme} />
      </div>
    </header>
  );
}
