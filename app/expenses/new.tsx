import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ImagePlus, X } from 'lucide-react-native';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import {
  useSubmitExpense,
  useSubmitExpenseClaim,
  useExpenseUploadUrl,
  uploadToPresignedUrl,
} from '../../lib/api/expenses';
import { BrandSpinner } from '../../components/BrandSpinner';
import { colors } from '../../constants/colors';

const CATEGORIES = [
  { value: 'Travel', label: 'Travel' },
  { value: 'Meals', label: 'Meals' },
  { value: 'Software', label: 'Software' },
  { value: 'Other', label: 'Other' },
] as const;

const CURRENCIES = ['INR', 'USD', 'GBP', 'EUR'] as const;

export default function NewExpenseScreen() {
  const [claimDate, setClaimDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState<string>('Travel');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [notes, setNotes] = useState('');
  const [receiptUris, setReceiptUris] = useState<{ uri: string; name: string; mime: string }[]>([]);

  const submitExpense = useSubmitExpense();
  const submitClaim = useSubmitExpenseClaim();
  const uploadUrl = useExpenseUploadUrl();

  const handleBack = () => router.back();

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to attach receipts.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.uri.split('/').pop() ?? `receipt-${Date.now()}.jpg`;
      const mime = 'image/jpeg';
      setReceiptUris((prev) => [...prev, { uri: asset.uri, name, mime }]);
    }
  }, []);

  const handleRemoveReceipt = (index: number) => {
    setReceiptUris((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadReceipts = async (claimId: string) => {
    for (const rec of receiptUris) {
      const { uploadUrl: url } = await uploadUrl.mutateAsync({
        claimId,
        fileName: rec.name,
        mimeType: rec.mime,
      });
      const res = await fetch(rec.uri);
      const blob = await res.blob();
      await uploadToPresignedUrl(url, blob, rec.mime);
    }
  };

  const handleSaveDraft = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    submitExpense.mutate(
      {
        claimDate,
        category,
        amount: numAmount,
        currency,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('Saved', 'Expense saved as draft.');
          router.replace('/expenses');
        },
        onError: (err) => Alert.alert('Error', err.message),
      }
    );
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    submitExpense.mutate(
      {
        claimDate,
        category,
        amount: numAmount,
        currency,
        notes: notes || undefined,
      },
      {
        onSuccess: async (claim) => {
          try {
            if (receiptUris.length > 0) {
              await uploadReceipts(claim.id);
            }
            submitClaim.mutate(claim.id, {
              onSuccess: () => {
                Alert.alert('Submitted', 'Expense claim submitted.');
                router.replace('/expenses');
              },
              onError: (err) => Alert.alert('Error', err.message),
            });
          } catch (err) {
            Alert.alert(
              'Error',
              err instanceof Error ? err.message : 'Failed to submit'
            );
          }
        },
        onError: (err) => Alert.alert('Error', err.message),
      }
    );
  };

  const isSubmitting =
    submitExpense.isPending || uploadUrl.isPending || submitClaim.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Expense</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={claimDate}
            onChangeText={setClaimDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.value}
                style={[styles.chip, category === c.value && styles.chipActive]}
                onPress={() => setCategory(c.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === c.value && styles.chipTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
            <View style={styles.currencyRow}>
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.currencyChip, currency === c && styles.currencyChipActive]}
                  onPress={() => setCurrency(c)}
                >
                  <Text
                    style={[
                      styles.currencyChipText,
                      currency === c && styles.currencyChipTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes"
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          <Text style={styles.label}>Receipt</Text>
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            <ImagePlus size={24} color={colors.accent} />
            <Text style={styles.receiptButtonText}>Add receipt photo</Text>
          </TouchableOpacity>
          {receiptUris.length > 0 && (
            <View style={styles.receiptPreviewRow}>
              {receiptUris.map((r, i) => (
                <View key={i} style={styles.receiptPreview}>
                  <Image source={{ uri: r.uri }} style={styles.receiptImage} />
                  <TouchableOpacity
                    style={styles.removeReceipt}
                    onPress={() => handleRemoveReceipt(i)}
                  >
                    <X size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.draftButton}
            onPress={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Text style={styles.draftButtonText}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <BrandSpinner size="sm" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  formSection: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  amountRow: {
    marginBottom: 16,
  },
  amountInput: {
    marginBottom: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}22`,
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  currencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyChipActive: {
    borderColor: colors.accent,
  },
  currencyChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  currencyChipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 80,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  receiptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  receiptPreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  receiptPreview: {
    position: 'relative',
  },
  receiptImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  removeReceipt: {
    position: 'absolute',
    top: -8,
    right: -8,
    padding: 4,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  draftButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
