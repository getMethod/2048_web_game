import type { ThemeMode, ThemeState } from '../theme/theme';
import styles from './ThemeSwitch.module.css';

interface ThemeSwitchProps {
  theme: ThemeState;
  onChange: (mode: ThemeMode) => void;
}

export function ThemeSwitch({ theme, onChange }: ThemeSwitchProps) {
  return (
    <div
      className={styles.switcher}
      role="group"
      aria-label="页面主题"
      data-theme-mode={theme.mode}
    >
      <span
        className={`${styles.indicator} ${theme.mode === 'dark' ? styles.indicatorDark : ''}`}
        aria-hidden="true"
      />
      <button
        className={styles.option}
        type="button"
        aria-pressed={theme.mode === 'light'}
        onClick={() => onChange('light')}
      >
        <span aria-hidden="true">☀</span>
        浅色
      </button>
      <button
        className={styles.option}
        type="button"
        aria-pressed={theme.mode === 'dark'}
        onClick={() => onChange('dark')}
      >
        <span aria-hidden="true">☾</span>
        深色
      </button>
    </div>
  );
}
