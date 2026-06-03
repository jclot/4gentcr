import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import DashboardScreen from '../screens/user/DashboardScreen';
import CapturePropertyScreen from '../screens/user/CapturePropertyScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import CommunityScreen from '../screens/user/CommunityScreen';
import { useTheme } from '../theme/ThemeContext';
import { Home, Camera, MessageSquare, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  IconComponent: any;
  label: string;
  focused: boolean;
}

const TabIcon = ({ IconComponent, label, focused }: TabIconProps) => {
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

export default function UserNavigator() {
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
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={Home} label="Inicio" focused={focused} /> }}
      />
      <Tab.Screen
        name="Capture"
        component={CapturePropertyScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={Camera} label="Capturar" focused={focused} /> }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={MessageSquare} label="Comunidad" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={User} label="Perfil" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}
