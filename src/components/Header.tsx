import type { UseThemeResult } from '../theme/useTheme';
import { ThemeSwitch } from './ThemeSwitch';
import { useActiveSection } from './useActiveSection';
import styles from './Header.module.css';

interface HeaderProps {
  theme: UseThemeResult;
}

export function Header({ theme }: HeaderProps) {
  const activeSection = useActiveSection();

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
          <a
            className={activeSection === 'introduction' ? styles.activeLink : undefined}
            href="#introduction"
            aria-current={activeSection === 'introduction' ? 'location' : undefined}
          >
            游戏介绍
          </a>
          <a
            className={activeSection === 'how-to-play' ? styles.activeLink : undefined}
            href="#how-to-play"
            aria-current={activeSection === 'how-to-play' ? 'location' : undefined}
          >
            玩法说明
          </a>
          <a
            className={`${styles.gameLink} ${activeSection === 'game' ? styles.activeLink : ''}`}
            href="#game"
            aria-current={activeSection === 'game' ? 'location' : undefined}
          >
            开始游戏
          </a>
        </nav>
        <ThemeSwitch theme={theme.theme} onChange={theme.setTheme} />
      </div>
    </header>
  );
}
