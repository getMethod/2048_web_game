import { useCallback, useEffect, useState } from 'react';
import { applyTheme, getInitialTheme, saveTheme, type ThemeMode, type ThemeState } from './theme';

export interface UseThemeResult {
  theme: ThemeState;
  setTheme: (mode: ThemeMode) => void;
}

export function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<ThemeState>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme.mode);
  }, [theme.mode]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState({ mode, source: 'user' });
    applyTheme(mode);
    saveTheme(mode);
  }, []);

  return { theme, setTheme };
}
