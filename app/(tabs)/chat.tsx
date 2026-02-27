import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useChatRooms, type ChatRoomWithMeta } from '../../lib/api/chat';
import { colors } from '../../constants/colors';

function RoomItem({ room }: { room: ChatRoomWithMeta }) {
  const preview = room.last_message?.content
    ? room.last_message.content.length > 50
      ? `${room.last_message.content.slice(0, 50)}…`
      : room.last_message.content
    : 'No messages yet';

  const timeAgo = room.last_message?.created_at
    ? formatDistanceToNow(new Date(room.last_message.created_at), { addSuffix: true })
    : '';

  const handlePress = () => {
    router.push(`/chat/${room.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.roomItem}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${room.name}, ${preview}`}
    >
      <View style={styles.avatar}>
        <MessageCircle size={24} color={colors.textSecondary} />
      </View>
      <View style={styles.roomContent}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>
          {timeAgo ? (
            <Text style={styles.timeAgo} numberOfLines={1}>
              {timeAgo}
            </Text>
          ) : null}
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.preview} numberOfLines={1}>
            {room.sender_profile?.full_name ? `${room.sender_profile.full_name}: ` : ''}
            {preview}
          </Text>
          {room.unread_count ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {room.unread_count > 99 ? '99+' : room.unread_count}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const { data: rooms = [], isLoading, error, refetch, isRefetching } = useChatRooms();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>Messages</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load rooms. Pull to retry.</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RoomItem room={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageCircle size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No chats yet</Text>
              <Text style={styles.emptySubtext}>
                Start a direct message or join a project chat
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingVertical: 8,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  roomContent: {
    flex: 1,
    minWidth: 0,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  preview: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.accent,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
  },
});
