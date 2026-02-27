import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';
import { Home, Briefcase, MessageCircle, User } from 'lucide-react-native';
import { FloatingTimerPill } from '../../components/FloatingTimerPill';
import { useNotifications } from '../../lib/api/notifications';

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
          tabBarStyle: {
            backgroundColor: colors.backgroundSecondary,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="work"
          options={{
            title: 'Work',
            tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          }}
        />
        <Tabs.Screen
          name="me"
          options={{
            title: 'Me',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
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

