import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import AdminMapScreen from '../screens/admin/AdminMapScreen';
import PropertyManagementScreen from '../screens/admin/PropertyManagementScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
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

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.bgCard, borderTopColor: Colors.border, height: 72, paddingBottom: 10 },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="AdminMap"
        component={AdminMapScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Mapa" emoji="🗺️" focused={focused} /> }}
      />
      <Tab.Screen
        name="Management"
        component={PropertyManagementScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Gestión" emoji="📋" focused={focused} /> }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Perfil" emoji="👤" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}