import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { MessageCircle, Search } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useChatRooms, type ChatRoomWithMeta } from '../../lib/api/chat';
import { colors } from '../../constants/colors';
import { GlassCard } from '../../components/GlassCard';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { uiTokens } from '../../constants/ui-tokens';

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
      style={styles.roomItemWrap}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${room.name}, ${preview}`}
    >
      <GlassCard noPadding>
        <View style={styles.roomItem}>
          <View style={styles.avatar}>
            <MessageCircle size={20} color={colors.textSecondary} />
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
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const { data: rooms = [], isLoading, error, refetch, isRefetching } = useChatRooms();

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>Conversations</Text>
      </View>
      <View style={styles.searchHint}>
        <Search size={14} color={colors.textTertiary} />
        <Text style={styles.searchHintText}>Recent rooms and direct messages</Text>
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
          ItemSeparatorComponent={() => <View style={{ height: uiTokens.spacing.sm }} />}
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: uiTokens.spacing.xl,
    paddingTop: uiTokens.spacing.lg,
    paddingBottom: uiTokens.spacing.sm,
    zIndex: 1,
  },
  title: {
    fontSize: uiTokens.text.headline,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchHint: {
    marginHorizontal: uiTokens.spacing.xl,
    marginBottom: uiTokens.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiTokens.spacing.sm,
    paddingHorizontal: uiTokens.spacing.md,
  },
  searchHintText: {
    color: colors.textTertiary,
    fontSize: uiTokens.text.caption,
  },
  listContent: {
    paddingHorizontal: uiTokens.spacing.xl,
    paddingBottom: uiTokens.spacing.xxxl,
    gap: uiTokens.spacing.sm,
  },
  roomItemWrap: {},
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uiTokens.spacing.md,
    paddingVertical: uiTokens.spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: uiTokens.spacing.md,
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
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  timeAgo: {
    fontSize: uiTokens.text.caption,
    color: colors.textTertiary,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  preview: {
    fontSize: uiTokens.text.body,
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
    padding: uiTokens.spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: uiTokens.text.body,
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
