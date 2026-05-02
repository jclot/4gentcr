import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import DashboardScreen from '../screens/user/DashboardScreen';
import CapturePropertyScreen from '../screens/user/CapturePropertyScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import CommunityScreen from '../screens/user/CommunityScreen';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) => (
  <View style={{ alignItems: 'center', paddingTop: 6 }}>
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
    <Text style={{ fontSize: 10, color: focused ? Colors.accent : Colors.textSecondary, marginTop: 2 }}>
      {label}
    </Text>
  </View>
);

export default function UserNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopColor: Colors.border,
          height: 72,
          paddingBottom: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Inicio" emoji="🏠" focused={focused} /> }}
      />
      <Tab.Screen
        name="Capture"
        component={CapturePropertyScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Capturar" emoji="📷" focused={focused} /> }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Comunidad" emoji="💬" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Perfil" emoji="👤" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}