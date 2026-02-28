import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useRef, useCallback, useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import {
  useChatRoom,
  useChatMessages,
  useSendMessage,
  type ChatMessage,
} from '../../lib/api/chat';
import { ChatBubble } from '../../components/ChatBubble';
import { ChatInput } from '../../components/ChatInput';
import { colors } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { GlassCard } from '../../components/GlassCard';
import { uiTokens } from '../../constants/ui-tokens';
import { useChatSounds } from '../../hooks/useChatSounds';

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!roomId || !userId) return;
    const channel = supabase
      .channel(`room-sounds:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: { record?: { sender_id?: string } }) => {
          const senderId = payload.record?.sender_id;
          if (senderId && senderId !== userId) {
            playReceiveSound();
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [roomId, userId, playReceiveSound]);

  const { playSendSound, playReceiveSound } = useChatSounds();
  const { data: room, isLoading: roomLoading } = useChatRoom(roomId ?? null);
  const {
    data: messages = [],
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(roomId ?? null);
  const sendMutation = useSendMessage(roomId ?? null);

  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const handleSend = useCallback(
    async (text: string, attachmentId?: string, attachmentMimeType?: string) => {
      if (!roomId || !userId) return;

      const tempId = `temp-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: tempId,
        room_id: roomId,
        sender_id: userId,
        content: text || (attachmentId ? '[Media]' : ''),
        reply_to_id: null,
        attachment_id: attachmentId ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender_profile: { full_name: 'You' },
        attachment:
          attachmentId && attachmentMimeType
            ? { id: attachmentId, s3_key: '', mime_type: attachmentMimeType, file_name: null, duration_seconds: null, file_size_bytes: null }
            : null,
      };

      setOptimisticMessages((prev) => [...prev, optimistic]);

      try {
        await sendMutation.mutateAsync({ content: text, attachmentId });
        setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
        playSendSound();
      } catch {
        setFailedIds((prev) => new Set(prev).add(tempId));
        setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    },
    [roomId, userId, sendMutation, playSendSound]
  );

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = e.nativeEvent.contentOffset.y;
      if (y < 100 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const allMessages = [...messages, ...optimisticMessages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item }) => {
      const isMe = item.sender_id === userId;
      const hasFailed = item.id.startsWith('temp-') && failedIds.has(item.id);

      return (
        <View style={styles.messageWrapper}>
          <ChatBubble
            message={item.content}
            isMe={isMe}
            timestamp={new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            senderName={isMe ? undefined : item.sender_profile?.full_name ?? 'Unknown'}
            attachment={item.attachment}
            attachmentId={item.attachment_id}
          />
          {hasFailed ? (
            <Text style={styles.failedText}>Failed to send. Tap to retry.</Text>
          ) : null}
        </View>
      );
    },
    [userId, failedIds]
  );

  const handleBack = () => router.back();

  if (roomLoading || !room) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <GlassCard style={styles.headerCard} noPadding>
          <View style={styles.headerCardInner}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {room.name}
            </Text>
          </View>
        </GlassCard>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messagesLoading && messages.length === 0 ? (
          <View style={styles.loadingMessages}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={allMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            inverted={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onScroll={handleScroll}
            scrollEventThrottle={200}
            ListHeaderComponent={
              isFetchingNextPage ? (
                <View style={styles.loadingOlder}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              ) : null
            }
          />
        )}

        <ChatInput roomId={roomId!} onSend={handleSend} />
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uiTokens.spacing.md,
    paddingVertical: uiTokens.spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: uiTokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    marginRight: 8,
  },
  headerCard: {
    flex: 1,
  },
  headerCardInner: {
    paddingHorizontal: uiTokens.spacing.md,
    paddingVertical: uiTokens.spacing.sm,
  },
  headerTitle: {
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '700',
    color: colors.text,
  },
  keyboardView: {
    flex: 1,
  },
  loadingMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: uiTokens.spacing.md,
    paddingBottom: 32,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  failedText: {
    fontSize: 11,
    color: colors.error,
    marginLeft: 4,
  },
  loadingOlder: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
