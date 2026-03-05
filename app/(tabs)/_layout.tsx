import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';
import { LayoutDashboard, Clapperboard, FileText, User } from 'lucide-react-native';
import { Platform } from 'react-native';
import { uiTokens } from '../../constants/ui-tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 14,
          right: 14,
          elevation: 0,
          height: 58,
          borderRadius: 999,
          borderTopWidth: 0,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
        },
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarItemStyle: {
          paddingTop: uiTokens.spacing.md,
          paddingBottom: uiTokens.spacing.md,
        },
      }}
    >
      <Tabs.Screen
        name="(dashboard)"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard size={focused ? 22 : 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shots"
        options={{
          title: 'Shots',
          tabBarIcon: ({ color, focused }) => (
            <Clapperboard size={focused ? 22 : 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Daily Log',
          tabBarIcon: ({ color, focused }) => (
            <FileText size={focused ? 22 : 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User size={focused ? 22 : 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="work" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="tasks" options={{ href: null }} />
      <Tabs.Screen name="me" options={{ href: null }} />
      <Tabs.Screen name="projects" options={{ href: null }} />
    </Tabs>
  );
}
