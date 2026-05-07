import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { Colors } from '../theme/colors';

import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';
import SplashScreen from '../screens/SplashScreen';

import PersonalDataScreen from '../screens/profile/PersonalDataScreen';
import CustomizationScreen from '../screens/profile/CustomizationScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PasswordScreen from '../screens/profile/PasswordScreen';
import TwoFAScreen from '../screens/profile/TwoFAScreen';
import HelpCenterScreen from '../screens/profile/HelpCenterScreen';
import RulesScreen from '../screens/profile/RulesScreen';

const Stack = createNativeStackNavigator();

const AppTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: Colors.bg },
};

export default function AppNavigator() {
  const { initStore, getCurrentUser, isLoading } = useAppStore();

  // Splash de arranque / auto-login
  const [splashDone, setSplashDone] = useState(false);

  // Splash de transición login/registro → stack principal
  // authSplashLoading: true = "sigue mostrando", false = "empezá a cerrar"
  const [showAuthSplash, setShowAuthSplash] = useState(false);
  const [authSplashLoading, setAuthSplashLoading] = useState(true);

  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    initStore();
  }, []);

  const user = getCurrentUser();

  useEffect(() => {
    // undefined = primera ejecución (arranque), no disparar splash de transición
    if (prevUserIdRef.current === undefined) {
      prevUserIdRef.current = user?.id ?? null;
      return;
    }

    // null → id: login o registro exitoso
    if (!prevUserIdRef.current && user?.id) {
      setAuthSplashLoading(true);   // mostrar con contenido
      setShowAuthSplash(true);

      // Dejar que el ícono y los puntos se vean un momento,
      // luego disparar el fade-out
      const t = setTimeout(() => setAuthSplashLoading(false), 700);
      return () => clearTimeout(t);
    }

    prevUserIdRef.current = user?.id ?? null;
  }, [user?.id]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <NavigationContainer theme={AppTheme}>
        {!user ? (
          <AuthNavigator />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user.role === 'admin' ? (
              <Stack.Screen name="AdminTabs" component={AdminNavigator} />
            ) : (
              <Stack.Screen name="UserTabs" component={UserNavigator} />
            )}
            <Stack.Screen name="PersonalData" component={PersonalDataScreen} />
            <Stack.Screen name="Customization" component={CustomizationScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Password" component={PasswordScreen} />
            <Stack.Screen name="TwoFA" component={TwoFAScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="Rules" component={RulesScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>

      {/* Splash de transición login/registro → muestra ícono y puntos, luego fade-out */}
      {showAuthSplash && (
        <SplashScreen
          loading={authSplashLoading}
          onHidden={() => setShowAuthSplash(false)}
          skipEntrance
        />
      )}

      {/* Splash de arranque — cubre initStore y el posible auto-login */}
      {!splashDone && (
        <SplashScreen
          loading={isLoading}
          onHidden={() => setSplashDone(true)}
        />
      )}
    </View>
  );
}