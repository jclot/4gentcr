import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';

// Navegadores Principales
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';

// Nuevas pantallas del perfil
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
  colors: {
    ...DefaultTheme.colors,
    background: Colors.bg, 
  },
};

export default function AppNavigator() {
  const { initStore, getCurrentUser, isLoading } = useAppStore();

  useEffect(() => {
    initStore();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  const user = getCurrentUser();

  return (
    <NavigationContainer theme={AppTheme}>
      {!user ? (
        <AuthNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {/* 1. Definimos las Tabs base según el rol del usuario */}
          {user.role === 'admin' ? (
            <Stack.Screen name="AdminTabs" component={AdminNavigator} />
          ) : (
            <Stack.Screen name="UserTabs" component={UserNavigator} />
          )}

          {/* 2. Definimos las pantallas secundarias compartidas (Sub-rutas del perfil) */}
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
  );
}