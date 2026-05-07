import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';
import { Colors } from '../theme/colors';
import {
  WALKTHROUGH_ENABLED,
  WALKTHROUGH_FORCE_SHOW_IN_DEV,
  WALKTHROUGH_STORAGE_KEY,
} from '../config/walkthrough';

import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';
import SplashScreen from '../screens/SplashScreen';
import WalkthroughScreen from '../screens/WalkthroughScreen';

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

  const [splashDone, setSplashDone] = useState(false);

  const [showAuthSplash, setShowAuthSplash] = useState(false);
  const [authSplashLoading, setAuthSplashLoading] = useState(true);

  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughChecked, setWalkthroughChecked] = useState(false);

  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    let isMounted = true;

    const loadWalkthrough = async () => {
      try {
        const seen = await AsyncStorage.getItem(WALKTHROUGH_STORAGE_KEY);
        const forceInDev = __DEV__ && WALKTHROUGH_FORCE_SHOW_IN_DEV;
        const shouldShow = WALKTHROUGH_ENABLED && (forceInDev || seen !== '1');

        if (isMounted) {
          setShowWalkthrough(shouldShow);
        }
      } catch {
        if (isMounted) {
          setShowWalkthrough(false);
        }
      } finally {
        if (isMounted) {
          setWalkthroughChecked(true);
        }
      }
    };

    loadWalkthrough();

    return () => {
      isMounted = false;
    };
  }, []);

  const user = getCurrentUser();

  const handleWalkthroughFinish = async () => {
    try {
      await AsyncStorage.setItem(WALKTHROUGH_STORAGE_KEY, '1');
    } finally {
      setShowWalkthrough(false);
    }
  };

  useEffect(() => {
    if (prevUserIdRef.current === undefined) {
      prevUserIdRef.current = user?.id ?? null;
      return;
    }

    if (!prevUserIdRef.current && user?.id) {
      setAuthSplashLoading(true);
      setShowAuthSplash(true);

      const t = setTimeout(() => setAuthSplashLoading(false), 700);
      return () => clearTimeout(t);
    }

    prevUserIdRef.current = user?.id ?? null;
  }, [user?.id]);

  const shouldShowWalkthrough = walkthroughChecked && splashDone && showWalkthrough;
  const canRenderApp = splashDone && walkthroughChecked && !showWalkthrough;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {canRenderApp && (
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
      )}

      {canRenderApp && showAuthSplash && (
        <SplashScreen
          loading={authSplashLoading}
          onHidden={() => setShowAuthSplash(false)}
          skipEntrance
        />
      )}

      {!splashDone && (
        <SplashScreen
          loading={isLoading}
          onHidden={() => setSplashDone(true)}
        />
      )}

      {shouldShowWalkthrough && (
        <WalkthroughScreen onFinish={handleWalkthroughFinish} />
      )}
    </View>
  );
}
