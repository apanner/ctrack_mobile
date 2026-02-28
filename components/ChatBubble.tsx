import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import { useAudioPlayer } from 'expo-audio';
import { Play, Pause } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { getAttachmentUrl } from '../lib/api/chat-media';
import type { ChatAttachment } from '../lib/api/chat';

interface ChatBubbleProps {
  message: string;
  isMe: boolean;
  timestamp: string;
  senderName?: string;
  attachment?: ChatAttachment | null;
  attachmentId?: string | null;
}

function ImageAttachment({
  attachmentId,
  isMe,
  onPress,
}: {
  attachmentId: string;
  isMe: boolean;
  onPress: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAttachmentUrl(attachmentId).then(setUrl).catch(() => setError(true));
  }, [attachmentId]);

  if (error || !url) {
    return (
      <View style={[styles.mediaPlaceholder, isMe && styles.mediaPlaceholderMe]}>
        {!url && !error ? (
          <ActivityIndicator size="small" color={isMe ? '#FFF' : colors.textSecondary} />
        ) : (
          <Text style={[styles.mediaError, isMe && styles.mediaErrorMe]}>Failed to load</Text>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} accessibilityRole="imagebutton">
      <Image
        source={{ uri: url }}
        style={styles.thumbnail}
        contentFit="cover"
      />
    </TouchableOpacity>
  );
}

function AudioAttachment({
  attachmentId,
  durationSeconds,
  isMe,
}: {
  attachmentId: string;
  durationSeconds: number | null;
  isMe: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAttachmentUrl(attachmentId).then(setUrl).catch(() => setError(true));
  }, [attachmentId]);

  const player = useAudioPlayer(url ? { uri: url } : undefined, { shouldPlay: false });
  const isPlaying = player.playing;

  const togglePlay = () => {
    if (!url || error) return;
    if (isPlaying) player.pause();
    else player.play();
  };

  const duration = durationSeconds != null ? Math.round(durationSeconds) : 0;
  const durationStr = `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`;

  if (error) {
    return (
      <View style={[styles.audioRow, isMe && styles.audioRowMe]}>
        <Text style={[styles.audioError, isMe && styles.audioErrorMe]}>Failed to load audio</Text>
      </View>
    );
  }

  return (
    <View style={[styles.audioRow, isMe && styles.audioRowMe]}>
      <TouchableOpacity
        onPress={togglePlay}
        style={[styles.playButton, isMe && styles.playButtonMe]}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause size={20} color={isMe ? '#FFF' : colors.text} />
        ) : (
          <Play size={20} color={isMe ? '#FFF' : colors.text} fill={isMe ? '#FFF' : colors.text} />
        )}
      </TouchableOpacity>
      <Text style={[styles.audioDuration, isMe && styles.audioDurationMe]}>{durationStr}</Text>
    </View>
  );
}

function FullscreenImageModal({ urlOrId, onClose }: { urlOrId: string; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (urlOrId.startsWith('http://') || urlOrId.startsWith('https://')) {
      setUrl(urlOrId);
    } else {
      getAttachmentUrl(urlOrId).then(setUrl);
    }
  }, [urlOrId]);

  return (
    <Modal visible transparent animationType="fade">
      <Pressable style={styles.fullscreenOverlay} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
        {url ? (
          <Image source={{ uri: url }} style={styles.fullscreenImage} contentFit="contain" />
        ) : (
          <ActivityIndicator size="large" color="#FFF" />
        )}
      </Pressable>
    </Modal>
  );
}

const GIF_URL_REGEX = /^https?:\/\/.+(giphy\.com|\.gif)/i;

function isGifUrl(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && GIF_URL_REGEX.test(trimmed);
}

export function ChatBubble({ message, isMe, timestamp, senderName, attachment, attachmentId }: ChatBubbleProps) {
  const [fullscreenImageId, setFullscreenImageId] = useState<string | null>(null);

  const hasImage = attachment?.mime_type?.startsWith('image/');
  const hasAudio = attachment?.mime_type?.startsWith('audio/');
  const idToUse = attachmentId ?? attachment?.id;
  const isGifMessage = message && isGifUrl(message);

  return (
    <View style={[styles.container, isMe ? styles.myMessage : styles.theirMessage]}>
      {!isMe && senderName && <Text style={styles.senderName}>{senderName}</Text>}
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
        {idToUse && hasImage && (
          <ImageAttachment attachmentId={idToUse} isMe={isMe} onPress={() => setFullscreenImageId(idToUse)} />
        )}
        {isGifMessage && (
          <TouchableOpacity onPress={() => setFullscreenImageId(message)} activeOpacity={0.9}>
            <Image source={{ uri: message }} style={styles.thumbnail} contentFit="cover" />
          </TouchableOpacity>
        )}
        {idToUse && hasAudio && (
          <AudioAttachment
            attachmentId={idToUse}
            durationSeconds={attachment?.duration_seconds ?? null}
            isMe={isMe}
          />
        )}
        {message && message !== '[Media]' && !isGifMessage && (
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {message}
          </Text>
        )}
      </View>
      <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
        {timestamp}
      </Text>

      {fullscreenImageId ? (
        <FullscreenImageModal urlOrId={fullscreenImageId} onClose={() => setFullscreenImageId(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  myBubble: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: colors.text,
  },
  senderName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textTertiary,
    marginHorizontal: 4,
  },
  myTimestamp: {
    textAlign: 'right',
  },
  theirTimestamp: {
    textAlign: 'left',
  },
  thumbnail: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginBottom: 4,
  },
  mediaPlaceholder: {
    width: 180,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  mediaPlaceholderMe: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  mediaError: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  mediaErrorMe: {
    color: 'rgba(255,255,255,0.8)',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  audioRowMe: {
    justifyContent: 'flex-end',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playButtonMe: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  audioDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  audioDurationMe: {
    color: 'rgba(255,255,255,0.9)',
  },
  audioError: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  audioErrorMe: {
    color: 'rgba(255,255,255,0.8)',
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
});
