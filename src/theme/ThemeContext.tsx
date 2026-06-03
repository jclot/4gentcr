import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { darkTheme, lightTheme, ThemeColors } from './themes';

export type { ThemeColors };

const TEXT_SCALES = { pequeño: 0.85, normal: 1.0, grande: 1.18 } as const;

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

interface ThemeContextValue {
  colors: ThemeColors;
  fs: (size: number) => number;
  haptics: boolean;
  animations: boolean;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkTheme,
  fs: (s) => s,
  haptics: true,
  animations: true,
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode, accent, textSize, haptics, animations, hydrate } = useThemeStore();
  const systemScheme = useColorScheme();

  useEffect(() => { hydrate(); }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark =
      themeMode === 'dark' ? true :
      themeMode === 'light' ? false :
      systemScheme !== 'light';

    const base = isDark ? darkTheme : lightTheme;
    const accentLight = hexToRgba(accent, 0.15);
    const colors: ThemeColors = { ...base, accent, accentLight };

    const scale = TEXT_SCALES[textSize as keyof typeof TEXT_SCALES] ?? 1.0;
    const fs = (size: number) => Math.round(size * scale);

    return { colors, fs, haptics, animations, isDark };
  }, [themeMode, accent, textSize, haptics, animations, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
