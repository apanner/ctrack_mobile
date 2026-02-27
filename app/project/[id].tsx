import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { colors } from '../../constants/colors';
import { TabControl } from '../../components/TabControl';
import { EmptyState } from '../../components/EmptyState';
import { ArrowLeft, FileSearch } from 'lucide-react-native';

export default function ProjectTasksScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('Upcoming');
  
  // TODO: Fetch tasks for this project
  const tasks: any[] = []; // Empty for now to show the empty state from screen3
  const isLoading = false;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <TabControl
        tabs={['Upcoming', 'Completed']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {tasks.length === 0 ? (
          <EmptyState
            title="All clear! No tasks here"
            subtitle="Time to relax or plan ahead."
            actionLabel="Create New Task"
            onAction={() => console.log('Create Task')}
            secondaryActionLabel="Check Other Projects"
            onSecondaryAction={() => router.back()}
            iconColor={colors.purple}
            accentColor={colors.purple}
            Icon={FileSearch}
          />
        ) : (
          <View style={styles.listContainer}>
             {/* Task list would go here */}
             <Text style={{ color: 'white' }}>Tasks list...</Text>
          </View>
        )}
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
});

