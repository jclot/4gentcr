import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import AdminMapScreen from '../screens/admin/AdminMapScreen';
import PropertyManagementScreen from '../screens/admin/PropertyManagementScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import { useTheme } from '../theme/ThemeContext';
import { Map, ClipboardList, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const TabIcon = ({ IconComponent, label, focused }: { IconComponent: any; label: string; focused: boolean }) => {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 70, marginTop: 6, gap: 4 }}>
      <IconComponent size={24} color={focused ? colors.accent : colors.textSecondary} />
      <Text
        numberOfLines={1}
        ellipsizeMode="clip"
        style={{
          fontSize: 10,
          fontWeight: (focused ? '700' : '500') as '700' | '500',
          color: focused ? colors.accent : colors.textSecondary,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default function AdminNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopWidth: 0,
          paddingTop: 15,
          borderTopColor: 'transparent',
          elevation: 0,
          shadowColor: 'transparent',
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
        },
      }}
    >
      <Tab.Screen
        name="AdminMap"
        component={AdminMapScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={Map} label="Mapa" focused={focused} /> }}
      />
      <Tab.Screen
        name="Management"
        component={PropertyManagementScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={ClipboardList} label="Gestión" focused={focused} /> }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={User} label="Perfil" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}
