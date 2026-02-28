import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useState, useCallback } from 'react';
import { Send, Plus, Image, Mic, Square, Smile, Film } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import { colors } from '../constants/colors';
import { useUploadChatMedia, uriToBlob } from '../lib/api/chat-media';
import { EmojiPicker } from './chat/EmojiPicker';
import { GifPicker } from './chat/GifPicker';

interface ChatInputProps {
  roomId: string;
  onSend: (message: string, attachmentId?: string, attachmentMimeType?: string) => void;
  disabled?: boolean;
}

export function ChatInput({ roomId, onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const { uploadImage: doUploadImage, uploadAudio: doUploadAudio } = useUploadChatMedia();

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const handleSend = useCallback(() => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  }, [message, onSend, disabled]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessage((m) => m + emoji);
  }, []);

  const handleGifSelect = useCallback(
    (gifUrl: string) => {
      onSend(gifUrl);
    },
    [onSend]
  );

  const handlePickImage = useCallback(async () => {
    setAttachOpen(false);
    if (disabled || uploading) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to share images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    let fileSize = asset.fileSize ?? 0;
    if (fileSize === 0) {
      const info = await FileSystem.getInfoAsync(uri, { size: true });
      fileSize = (info as { size?: number }).size ?? 0;
    }

    if (fileSize > 5 * 1024 * 1024) {
      Alert.alert('Image too large', 'Please select an image under 5MB.');
      return;
    }

    const ext = uri.split('.').pop() ?? 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `image_${Date.now()}.${ext}`;

    setUploading(true);
    try {
      const attachmentId = await doUploadImage({
        roomId,
        uri,
        mimeType,
        fileName,
        fileSizeBytes: fileSize,
      });
      onSend('', attachmentId, mimeType);
    } catch (err) {
      Alert.alert('Upload failed', (err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [roomId, onSend, disabled, uploading, doUploadImage]);

  const handleStartRecording = useCallback(async () => {
    setAttachOpen(false);
    if (disabled || uploading) return;

    const status = await AudioModule.requestRecordingPermissionsAsync();
    if (!status.granted) {
      Alert.alert('Permission needed', 'Allow microphone access to record voice messages.');
      return;
    }

    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  }, [disabled, uploading, audioRecorder]);

  const handleStopRecording = useCallback(async () => {
    if (!recorderState.isRecording) return;

    await audioRecorder.stop();
    const uri = (audioRecorder as { uri?: string }).uri;
    if (!uri) return;

    const durationMs = recorderState.durationMillis ?? 0;
    const durationSeconds = durationMs / 1000;
    if (durationSeconds > 120) {
      Alert.alert('Audio too long', 'Please keep recordings under 2 minutes.');
      return;
    }

    setUploading(true);
    try {
      const blob = await uriToBlob(uri, 'audio/m4a');
      const attachmentId = await doUploadAudio({
        roomId,
        blob,
        mimeType: 'audio/m4a',
        fileName: `audio_${Date.now()}.m4a`,
        durationSeconds,
      });
      onSend('', attachmentId, 'audio/m4a');
    } catch (err) {
      Alert.alert('Upload failed', (err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [roomId, onSend, audioRecorder, recorderState, doUploadAudio]);

  const openEmoji = useCallback(() => {
    setAttachOpen(false);
    setEmojiOpen(true);
  }, []);

  const openGif = useCallback(() => {
    setAttachOpen(false);
    setGifOpen(true);
  }, []);

  const isRecording = recorderState.isRecording;
  const canSend = message.trim() && !disabled && !uploading;

  return (
    <View style={styles.container}>
      {!isRecording ? (
        <TouchableOpacity
          style={[styles.attachButton, (disabled || uploading) && styles.buttonDisabled]}
          onPress={() => setAttachOpen(true)}
          disabled={disabled || uploading}
          accessibilityRole="button"
          accessibilityLabel="Add attachment"
        >
          <Plus size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.attachButton, styles.recordButton]}
          onPress={handleStopRecording}
          accessibilityRole="button"
          accessibilityLabel="Stop recording"
        >
          <Square size={22} color="#E53935" fill="#E53935" />
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor={colors.textTertiary}
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={500}
        editable={!disabled}
      />

      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Send size={20} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      <Modal visible={attachOpen} transparent animationType="fade">
        <Pressable style={styles.attachOverlay} onPress={() => setAttachOpen(false)}>
          <View style={styles.attachMenu}>
            <TouchableOpacity style={styles.attachMenuItem} onPress={openEmoji}>
              <Smile size={24} color={colors.accent} />
              <Text style={styles.attachMenuLabel}>Emoji</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachMenuItem} onPress={openGif}>
              <Film size={24} color={colors.accent} />
              <Text style={styles.attachMenuLabel}>GIF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachMenuItem} onPress={handlePickImage}>
              <Image size={24} color={colors.accent} />
              <Text style={styles.attachMenuLabel}>Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachMenuItem} onPress={handleStartRecording}>
              <Mic size={24} color={colors.accent} />
              <Text style={styles.attachMenuLabel}>Audio</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <EmojiPicker
        visible={emojiOpen}
        onClose={() => setEmojiOpen(false)}
        onSelect={handleEmojiSelect}
      />
      <GifPicker visible={gifOpen} onClose={() => setGifOpen(false)} onSelect={handleGifSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachButton: {
    padding: 10,
    marginRight: 4,
  },
  recordButton: {
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    color: colors.text,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.backgroundTertiary,
    opacity: 0.5,
  },
  attachOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  attachMenu: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
  },
  attachMenuItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  attachMenuLabel: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
});
