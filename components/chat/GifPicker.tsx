import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { uiTokens } from '../../constants/ui-tokens';
import {
  searchGiphy,
  getTrendingGifs,
  hasGiphyApiKey,
  type GiphySearchResponse,
} from '../../lib/api/giphy';

interface GifPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

function GifItem({
  uri,
  onPress,
}: {
  uri: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.gifItem} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri }} style={styles.gifImage} resizeMode="cover" />
    </TouchableOpacity>
  );
}

export function GifPicker({ visible, onClose, onSelect }: GifPickerProps) {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<GiphySearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasKey = hasGiphyApiKey();

  const search = useCallback(async (q: string) => {
    if (!hasKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = q.trim()
        ? await searchGiphy(q, { limit: 24 })
        : await getTrendingGifs({ limit: 24 });
      setData(res);
    } catch (e) {
      setError((e as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [hasKey]);

  const handleSearch = useCallback(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    if (visible && hasKey) {
      search('');
    }
  }, [visible, hasKey, search]);

  if (!visible) return null;

  const gifs = data?.data ?? [];
  const urls = gifs.map((g) => g.images.fixed_height.url);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>GIF</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {!hasKey ? (
            <View style={styles.noKey}>
              <Text style={styles.noKeyText}>
                Add EXPO_PUBLIC_GIPHY_API_KEY to enable GIF search
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search GIFs..."
                  placeholderTextColor={colors.textTertiary}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                  <Search size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color={colors.accent} />
                </View>
              ) : error ? (
                <View style={styles.error}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (
                <FlatList
                  data={urls}
                  keyExtractor={(uri, i) => uri + i}
                  numColumns={3}
                  renderItem={({ item }) => (
                    <GifItem
                      uri={item}
                      onPress={() => {
                        onSelect(item);
                        onClose();
                      }}
                    />
                  )}
                  contentContainerStyle={styles.list}
                />
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const SIZE = Platform.OS === 'web' ? 120 : 110;

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
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: uiTokens.spacing.md,
    paddingHorizontal: uiTokens.spacing.lg,
  },
  title: {
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  noKey: {
    padding: uiTokens.spacing.xl,
    alignItems: 'center',
  },
  noKeyText: {
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uiTokens.spacing.md,
    paddingBottom: uiTokens.spacing.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 16,
  },
  searchButton: {
    padding: 10,
  },
  loading: {
    padding: 40,
    alignItems: 'center',
  },
  error: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  list: {
    padding: uiTokens.spacing.sm,
  },
  gifItem: {
    width: SIZE,
    height: SIZE,
    margin: 4,
  },
  gifImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});
