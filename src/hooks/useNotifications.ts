import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Linking } from 'react-native';
import { useNotificationStore, PermissionStatus } from '../store/useNotificationStore';

// ─── Test notification payloads ──────────────────────────────────────────────
// Remove or replace with real triggers when going to production.

export type NotificationTestType = 'capture_reminder' | 'status_update' | 'payment' | 'promo';

const TEST_PAYLOADS: Record<NotificationTestType, { title: string; body: string }> = {
  capture_reminder: {
    title: '📍 Zona activa cerca de vos',
    body: 'Hay propiedades para capturar en tu área. ¡No pierdas el bono semanal!',
  },
  status_update: {
    title: '🔄 Propiedad actualizada',
    body: 'Tu captura en San José pasó a estado "En Negociación".',
  },
  payment: {
    title: '💰 ¡Pago acreditado!',
    body: '₡250 fueron acreditados por tu última captura validada.',
  },
  promo: {
    title: '🎉 Nueva función en Virtual Agent',
    body: 'Explorá las mejoras y bonos especiales de la versión más reciente.',
  },
};

const ANDROID_CHANNEL_ID = 'virtualagent-default';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const { hydrated, setPermissionStatus, hydrate } = useNotificationStore();

  useEffect(() => {
    if (!hydrated) hydrate();
    _syncPermissionStatus(setPermissionStatus);
    if (Platform.OS === 'android') _ensureAndroidChannel();
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    if (!Device.isDevice) {
      setPermissionStatus('undetermined');
      return false;
    }
    try {
      if (Platform.OS === 'android') await _ensureAndroidChannel();
      const { status } = await Notifications.requestPermissionsAsync();
      const mapped = _mapStatus(status);
      setPermissionStatus(mapped);
      return mapped === 'granted';
    } catch {
      setPermissionStatus('undetermined');
      return false;
    }
  };

  const openSettings = () => Linking.openSettings();

  // ── Test helpers (remove in production) ──────────────────────────────────

  const scheduleTest = async (type: NotificationTestType): Promise<void> => {
    const ok = await _ensureGranted(requestPermissions);
    if (!ok) return;
    try {
      const { title, body } = TEST_PAYLOADS[type];
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null, // fire immediately; foreground handler shows alert
      });
    } catch {
      // Silently ignored in Expo Go — use a development build to test notifications.
    }
  };

  return { requestPermissions, openSettings, scheduleTest };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function _syncPermissionStatus(setter: (s: PermissionStatus) => void) {
  if (!Device.isDevice) {
    setter('undetermined');
    return;
  }
  try {
    const { status } = await Notifications.getPermissionsAsync();
    setter(_mapStatus(status));
  } catch {
    setter('undetermined');
  }
}

async function _ensureAndroidChannel() {
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Virtual Agent',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6C63FF',
    sound: 'default',
  });
}

async function _ensureGranted(
  requestFn: () => Promise<boolean>,
): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  return requestFn();
}

function _mapStatus(
  status: Notifications.PermissionStatus | string,
): PermissionStatus {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}
