import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Receipt, Plus } from 'lucide-react-native';
import { format } from 'date-fns';
import { useExpenses, type ExpenseClaim } from '../../lib/api/expenses';
import { BrandSpinner } from '../../components/BrandSpinner';
import { colors } from '../../constants/colors';

export default function ExpensesScreen() {
  const { data: claims = [], isLoading } = useExpenses();

  const handleBack = () => router.back();
  const handleNewExpense = () => router.push('/expenses/new');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <BrandSpinner size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Claims</Text>
      </View>

      <TouchableOpacity
        style={styles.addCard}
        onPress={handleNewExpense}
        activeOpacity={0.8}
      >
        <Plus size={24} color={colors.accent} />
        <Text style={styles.addCardText}>New Expense Claim</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>My Claims</Text>
          {claims.length === 0 ? (
            <Text style={styles.emptyText}>No expense claims yet.</Text>
          ) : (
            claims.map((item) => <ExpenseCard key={item.id} claim={item} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExpenseCard({ claim }: { claim: ExpenseClaim }) {
  const statusColor =
    claim.status === 'Approved' || claim.status === 'Paid'
      ? colors.success
      : claim.status === 'Rejected'
        ? colors.error
        : claim.status === 'Draft'
          ? colors.textSecondary
          : colors.warning;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Receipt size={20} color={colors.accent} />
          <Text style={styles.cardCategory}>{claim.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {claim.status}
          </Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.cardAmount}>
          {claim.currency} {claim.amount.toFixed(2)}
        </Text>
        <Text style={styles.cardDate}>
          {format(new Date(claim.claim_date), 'MMM dd, yyyy')}
        </Text>
      </View>
    </View>
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
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  scrollView: {
    flex: 1,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  cardDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
