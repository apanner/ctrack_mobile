import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Modal } from 'react-native';
import { colors } from '../../constants/colors';
import { uiTokens } from '../../constants/ui-tokens';

const COMMON_EMOJIS = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
  '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '🤝',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖',
  '🔥', '✨', '⭐', '🌟', '💫', '✅', '❌', '❗', '❓', '‼️',
  '😢', '😭', '😤', '😡', '🤔', '🤯', '😱', '🥳', '😎', '🤓',
  '🎉', '🎊', '🙏', '💪', '👍', '👀', '🤷', '🙈', '🙉', '🙊',
];

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ visible, onClose, onSelect }: EmojiPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close emoji picker"
      >
        <View style={styles.panel} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Emoji</Text>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.grid}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {COMMON_EMOJIS.map((emoji, i) => (
              <TouchableOpacity
                key={`${emoji}-${i}`}
                style={styles.emojiButton}
                onPress={() => {
                  onSelect(emoji);
                  onClose();
                }}
                accessibilityLabel={`Select emoji ${emoji}`}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const EMOJI_SIZE = 36;
const COLS = 8;
const GAP = 4;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 320,
    paddingBottom: uiTokens.spacing.xl,
  },
  header: {
    paddingVertical: uiTokens.spacing.md,
    paddingHorizontal: uiTokens.spacing.lg,
  },
  title: {
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '600',
    color: colors.text,
  },
  scroll: {
    maxHeight: 260,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: uiTokens.spacing.md,
    paddingBottom: uiTokens.spacing.lg,
  },
  emojiButton: {
    width: EMOJI_SIZE + GAP * 2,
    height: EMOJI_SIZE + GAP * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
});
