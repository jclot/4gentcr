import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@virtualagent_notifications';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationPrefs {
  newProps: boolean;
  statusChange: boolean;
  payments: boolean;
  marketing: boolean;
}

interface NotificationState extends NotificationPrefs {
  permissionStatus: PermissionStatus;
  hydrated: boolean;
  setPreference: (key: keyof NotificationPrefs, value: boolean) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  hydrate: () => Promise<void>;
}

const _persist = (state: NotificationState) => {
  const { newProps, statusChange, payments, marketing } = state;
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ newProps, statusChange, payments, marketing }),
  ).catch(() => {});
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  newProps: true,
  statusChange: true,
  payments: true,
  marketing: false,
  permissionStatus: 'undetermined',
  hydrated: false,

  setPreference: (key, value) => {
    set({ [key]: value });
    _persist(get());
  },

  setPermissionStatus: (permissionStatus) => set({ permissionStatus }),

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
