import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  SectionList,
} from 'react-native';
import { router } from 'expo-router';
import { MessageCircle, Search, UserPlus } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useState, useMemo } from 'react';
import {
  useChatRooms,
  useChatUsers,
  useCreateChatRoom,
  type ChatRoomWithMeta,
  type ChatUser,
} from '../../lib/api/chat';
import { useCurrentUser } from '../../lib/api/profile';
import { colors } from '../../constants/colors';
import { GlassCard } from '../../components/GlassCard';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { uiTokens } from '../../constants/ui-tokens';
import { LinearGradient } from 'expo-linear-gradient';

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

function UserItem({
  user,
  onCreateAndOpen,
  isCreating,
}: {
  user: ChatUser;
  onCreateAndOpen: (userId: string) => void;
  isCreating: boolean;
}) {
  const handlePress = () => {
    if (!isCreating) onCreateAndOpen(user.id);
  };

  return (
    <TouchableOpacity
      style={styles.userItemWrap}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isCreating}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${user.full_name || 'User'}`}
    >
      <GlassCard noPadding>
        <View style={styles.userItem}>
          <View style={styles.userAvatar}>
            <LinearGradient
              colors={[colors.cyan, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userAvatarGradient}
            >
              <Text style={styles.userAvatarText}>
                {(user.full_name || 'U').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName} numberOfLines={1}>
            {user.full_name || 'Unknown'}
          </Text>
          {isCreating ? (
            <ActivityIndicator size="small" color={colors.accent} style={styles.userLoader} />
          ) : (
            <UserPlus size={18} color={colors.textTertiary} />
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: currentUser } = useCurrentUser();
  const { data: rooms = [], isLoading: roomsLoading, error, refetch, isRefetching } = useChatRooms();
  const { data: users = [], isLoading: usersLoading } = useChatUsers();
  const createRoom = useCreateChatRoom();
  const [creatingForUserId, setCreatingForUserId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.full_name ?? '').toLowerCase().includes(q) ||
        (u.id ?? '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const handleCreateAndOpen = async (otherUserId: string) => {
    if (!currentUser?.id || createRoom.isPending) return;
    setCreatingForUserId(otherUserId);
    try {
      const room = await createRoom.mutateAsync({
        type: 'direct',
        otherUserId,
      });
      router.push(`/chat/${room.id}`);
    } catch (err) {
      console.error('Failed to create chat:', err);
      // Could show toast
    } finally {
      setCreatingForUserId(null);
    }
  };

  const sections = useMemo(() => {
    const result: { title: string; data: (ChatRoomWithMeta | ChatUser)[] }[] = [];
    if (rooms.length > 0) {
      result.push({ title: 'Recent chats', data: rooms });
    }
    result.push({
      title: 'Start new chat',
      data: filteredUsers,
    });
    return result;
  }, [rooms, filteredUsers]);

  if (roomsLoading) {
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
        <Text style={styles.subtitle}>Message your team</Text>
      </View>

      <View style={styles.searchWrap}>
        <Search size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load. Pull to retry.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => (item as { id: string }).id}
          renderItem={({ item, section }) => {
            if (section.title === 'Recent chats') {
              return <RoomItem room={item as ChatRoomWithMeta} />;
            }
            return (
              <UserItem
                user={item as ChatUser}
                onCreateAndOpen={handleCreateAndOpen}
                isCreating={createRoom.isPending && creatingForUserId === (item as ChatUser).id}
              />
            );
          }}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: uiTokens.spacing.sm }} />}
          SectionSeparatorComponent={() => <View style={{ height: uiTokens.spacing.lg }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            usersLoading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MessageCircle size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No users found</Text>
                <Text style={styles.emptySubtext}>Team members will appear here</Text>
              </View>
            )
          }
          stickySectionHeadersEnabled={false}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiTokens.spacing.sm,
    marginHorizontal: uiTokens.spacing.xl,
    marginBottom: uiTokens.spacing.md,
    paddingHorizontal: uiTokens.spacing.md,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.08,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: uiTokens.spacing.xl,
    paddingBottom: uiTokens.spacing.xxxl,
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
  userItemWrap: {},
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uiTokens.spacing.md,
    paddingVertical: uiTokens.spacing.md,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: uiTokens.spacing.md,
  },
  userAvatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  userName: {
    flex: 1,
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '600',
    color: colors.text,
  },
  userLoader: {
    marginLeft: 8,
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
