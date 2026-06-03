import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@virtualagent_theme';

export type ThemeMode = 'dark' | 'light' | 'system';
export type TextSize = 'pequeño' | 'normal' | 'grande';

interface ThemeState {
  themeMode: ThemeMode;
  accent: string;
  textSize: TextSize;
  haptics: boolean;
  animations: boolean;
  hydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setAccent: (color: string) => void;
  setTextSize: (size: TextSize) => void;
  setHaptics: (enabled: boolean) => void;
  setAnimations: (enabled: boolean) => void;
  hydrate: () => Promise<void>;
}

const _persist = (state: ThemeState) => {
  const { themeMode, accent, textSize, haptics, animations } = state;
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ themeMode, accent, textSize, haptics, animations }),
  ).catch(() => {});
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'dark',
  accent: '#6C63FF',
  textSize: 'normal',
  haptics: true,
  animations: true,
  hydrated: false,

  setThemeMode: (themeMode) => { set({ themeMode }); _persist(get()); },
  setAccent: (accent) => { set({ accent }); _persist(get()); },
  setTextSize: (textSize) => { set({ textSize }); _persist(get()); },
  setHaptics: (haptics) => { set({ haptics }); _persist(get()); },
  setAnimations: (animations) => { set({ animations }); _persist(get()); },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        set({ ...saved, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));
