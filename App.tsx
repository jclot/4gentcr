import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalModal from './src/components/GlobalModal';

// Configure foreground notification behavior.
// Wrapped in try/catch: expo-notifications native module is not available in
// Expo Go (SDK 50+) and will throw when accessed on that runtime.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (_) {
  // Silently ignored in Expo Go — use a development build for local notifications.
}

function AppRoot() {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
      <AppNavigator />
      <GlobalModal />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppRoot />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
