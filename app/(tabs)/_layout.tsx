import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';
import { Home, Briefcase, MessageCircle, User } from 'lucide-react-native';
import { FloatingTimerPill } from '../../components/FloatingTimerPill';
import { useNotifications } from '../../lib/api/notifications';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';
import { uiTokens } from '../../constants/ui-tokens';

export default function TabsLayout() {
  const { data: notificationsData } = useNotifications();
  const unreadCount = notificationsData?.unreadCount ?? 0;

  return (
    <>
      <FloatingTimerPill />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          sceneStyle: {
            backgroundColor: colors.background,
          },
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 24 : 16,
            left: uiTokens.spacing.lg,
            right: uiTokens.spacing.lg,
            elevation: 0,
            height: 64,
            borderRadius: 32,
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
          },
          tabBarHideOnKeyboard: true,
          tabBarBackground: () => (
            <BlurView 
              intensity={60} 
              tint="dark" 
              style={[StyleSheet.absoluteFill, { borderRadius: 32, overflow: 'hidden', backgroundColor: 'rgba(24,24,27,0.6)' }]} 
            />
          ),
          tabBarShowLabel: false,
          tabBarItemStyle: {
            paddingTop: uiTokens.spacing.md,
            paddingBottom: uiTokens.spacing.md,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Home size={focused ? 22 : 20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="work"
          options={{
            title: 'Work',
            tabBarIcon: ({ color, focused }) => (
              <Briefcase size={focused ? 22 : 20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, focused }) => (
              <MessageCircle size={focused ? 22 : 20} color={color} />
            ),
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          }}
        />
        <Tabs.Screen
          name="me"
          options={{
            title: 'Me',
            tabBarIcon: ({ color, focused }) => (
              <User size={focused ? 22 : 20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="projects"
          options={{ href: null }}
        />
      </Tabs>
    </>
  );
}

