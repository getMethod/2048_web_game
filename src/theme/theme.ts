export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  mode: ThemeMode;
  source: 'system' | 'user';
}

export const THEME_STORAGE_KEY = 'jy-2048:theme:v1';

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

export function getInitialTheme(): ThemeState {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeMode(saved)) {
      return { mode: saved, source: 'user' };
    }
  } catch {
    // 存储不可用时仍允许按系统主题正常运行。
  }

  const mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return { mode, source: 'system' };
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
}

export function saveTheme(mode: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // 隐私模式或存储配额异常不应阻断主题切换。
  }
}
