import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useNotificationsInfinite, useMarkAsRead, type NotificationEvent } from '../../lib/api/notifications';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../constants/colors';
import { format } from 'date-fns';
import { Bell } from 'lucide-react-native';

function NotificationItem({
  item,
  onPress,
  onMarkRead,
}: {
  item: NotificationEvent;
  onPress: () => void;
  onMarkRead: () => void;
}) {
  const handlePress = () => {
    if (!item.is_read) onMarkRead();
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <GlassCard style={[styles.notifCard, !item.is_read && styles.unreadCard]}>
        <View style={styles.notifRow}>
          <View style={styles.notifIcon}>
            <Bell size={20} color={colors.accent} />
          </View>
          <View style={styles.notifContent}>
            <Text style={styles.notifTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.body ? (
              <Text style={styles.notifBody} numberOfLines={2}>
                {item.body}
              </Text>
            ) : null}
            <Text style={styles.notifTime}>
              {format(new Date(item.created_at), 'MMM d, h:mm a')}
            </Text>
          </View>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
      </GlassCard>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNotificationsInfinite(false);
  const markAsRead = useMarkAsRead();

  const items = data?.pages.flatMap((p) => p.data) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  const handleNotificationPress = (item: NotificationEvent) => {
    if (!item.is_read) {
      markAsRead.mutate(item.id);
    }
    if (item.deep_link) {
      const path = item.deep_link.startsWith('/') ? item.deep_link : `/${item.deep_link}`;
      router.push(path as import('expo-router').Href);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ title: 'Notifications' }} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerRight: () =>
            unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            ) : null,
        }}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onPress={() => handleNotificationPress(item)}
            onMarkRead={() => markAsRead.mutate(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bell size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  notifCard: {
    marginBottom: 12,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notifIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  notifBody: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  notifTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginLeft: 8,
    marginTop: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.error,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
