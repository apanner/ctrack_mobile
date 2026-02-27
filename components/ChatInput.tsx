import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useCallback } from 'react';
import { Send, Image, Mic, Square } from 'lucide-react-native';
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

interface ChatInputProps {
  roomId: string;
  onSend: (message: string, attachmentId?: string, attachmentMimeType?: string) => void;
  disabled?: boolean;
}

export function ChatInput({ roomId, onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const { uploadImage: doUploadImage, uploadAudio: doUploadAudio } = useUploadChatMedia();

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const handleSend = useCallback(() => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  }, [message, onSend, disabled]);

  const handlePickImage = useCallback(async () => {
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

  const isRecording = recorderState.isRecording;
  const canSend = message.trim() && !disabled && !uploading;

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.attachButton, (disabled || uploading) && styles.buttonDisabled]}
          onPress={handlePickImage}
          disabled={disabled || uploading}
          accessibilityRole="button"
          accessibilityLabel="Attach image"
        >
          <Image size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        {!isRecording ? (
          <TouchableOpacity
            style={[styles.attachButton, (disabled || uploading) && styles.buttonDisabled]}
            onPress={handleStartRecording}
            disabled={disabled || uploading}
            accessibilityRole="button"
            accessibilityLabel="Record voice message"
          >
            <Mic size={22} color={colors.textSecondary} />
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
      </View>

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
  actionsRow: {
    flexDirection: 'row',
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
});
