import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';
import { Home, Clock, MessageCircle, User } from 'lucide-react-native';
import { FloatingTimerPill } from '../../components/FloatingTimerPill';
import { useNotifications } from '../../lib/api/notifications';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';
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
          tabBarActiveTintColor: colors.cyan,
          tabBarInactiveTintColor: colors.textTertiary,
          sceneStyle: {
            backgroundColor: colors.background,
          },
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 24 : 16,
            left: 14,
            right: 14,
            elevation: 0,
            height: 58,
            borderRadius: 999,
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 32,
          },
          tabBarHideOnKeyboard: true,
          tabBarBackground: () => (
            <View style={StyleSheet.absoluteFill}>
              <BlurView
                intensity={40}
                tint="dark"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    borderRadius: 999,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(18,18,20,0.82)',
                  },
                ]}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: 'rgba(0,229,255,0.08)',
                }}
              />
            </View>
          ),
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
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
              <Clock size={focused ? 22 : 20} color={color} />
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
          name="tasks"
          options={{ href: null }}
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

