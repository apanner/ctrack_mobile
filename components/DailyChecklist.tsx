import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassCard } from './GlassCard';
import { colors } from '../constants/colors';
import { CheckCircle, Circle } from 'lucide-react-native';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useDashboard } from '../lib/api/dashboard';

const CHECKLIST_STORAGE_KEY = 'ctrack-daily-checklist';

interface ChecklistItem {
  id: string;
  label: string;
  action?: string; // route to navigate
  dynamic?: boolean; // e.g. first task from today
}

const STATIC_ITEMS: ChecklistItem[] = [
  { id: 'submit-timesheet', label: 'Submit timesheet', action: '/(tabs)/work' },
  { id: 'join-standup', label: 'Join standup', dynamic: false },
];

function getDateKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

interface StoredState {
  date: string;
  completed: Record<string, boolean>;
}

async function loadChecklistState(): Promise<StoredState> {
  try {
    const raw = await AsyncStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return { date: getDateKey(), completed: {} };
    const parsed = JSON.parse(raw) as StoredState;
    if (parsed.date !== getDateKey()) {
      return { date: getDateKey(), completed: {} };
    }
    return parsed;
  } catch {
    return { date: getDateKey(), completed: {} };
  }
}

async function saveChecklistState(state: StoredState): Promise<void> {
  await AsyncStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state));
}

export function DailyChecklist() {
  const { data: dashboard } = useDashboard();
  const [state, setState] = useState<StoredState>({ date: getDateKey(), completed: {} });

  useEffect(() => {
    loadChecklistState().then(setState);
  }, []);

  const handleToggle = useCallback(async (id: string) => {
    const next = {
      ...state,
      completed: { ...state.completed, [id]: !state.completed[id] },
    };
    setState(next);
    await saveChecklistState(next);
  }, [state]);

  const handleItemPress = useCallback((item: ChecklistItem) => {
    if (item.action) router.push(item.action as import('expo-router').Href);
  }, []);

  const todayTask = dashboard?.pendingTasks?.[0];
  const items: ChecklistItem[] = [
    ...STATIC_ITEMS,
    ...(todayTask
      ? [
          {
            id: `task-${todayTask.id}`,
            label: (todayTask as { title?: string }).title ?? (todayTask as { task_name?: string }).task_name ?? 'Task from today',
            action: `/shot/${(todayTask as { shot_id?: string }).shot_id ?? todayTask.id}`,
            dynamic: true,
          } as ChecklistItem,
        ]
      : []),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Checklist</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {items.map((item) => {
          const done = state.completed[item.id];
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleItemPress(item)}
              onLongPress={() => handleToggle(item.id)}
              activeOpacity={0.8}
            >
              <GlassCard style={styles.card}>
                <View style={styles.row}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggle(item.id);
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    {done ? (
                      <CheckCircle size={24} color={colors.success} fill={colors.success} />
                    ) : (
                      <Circle size={24} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                  <Text
                    style={[styles.label, done && styles.labelDone]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  scroll: {
    flexGrow: 0,
  },
  card: {
    marginRight: 12,
    minWidth: 140,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  labelDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
});
