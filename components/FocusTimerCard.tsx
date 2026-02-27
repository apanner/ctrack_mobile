import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { useFocusTimer } from '../contexts/FocusTimerContext';
import { useDashboard } from '../lib/api/dashboard';
import { GlassCard } from './GlassCard';
import { colors } from '../constants/colors';
import { Play, Pause, Square, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function FocusTimerCard() {
  const {
    isRunning,
    elapsedSeconds,
    remainingSeconds,
    progressPercent,
    preset,
    setPreset,
    setTask,
    taskId,
    start,
    pause,
    stop,
    reset,
    presetSeconds,
  } = useFocusTimer();
  const { data: dashboard } = useDashboard();

  const tasks = dashboard?.pendingTasks ?? [];
  const selectedTask = taskId ? tasks.find((t) => t.id === taskId) : null;

  const [showTaskPicker, setShowTaskPicker] = React.useState(false);
  const [showPresetPicker, setShowPresetPicker] = React.useState(false);

  const handleStart = () => {
    start();
  };

  const handlePause = () => {
    pause();
  };

  const handleReset = () => {
    stop();
    reset();
    setTask(null, null);
  };

  const handleStopWithSave = () => {
    const hours = Math.round((elapsedSeconds / 3600) * 100) / 100;
    const tid = taskId ?? '';
    const sid = selectedTask && 'shot_id' in selectedTask ? selectedTask.shot_id : '';
    stop();
    reset();
    setTask(null, null);
    router.push({
      pathname: '/(tabs)/work',
      params: { focusHours: hours.toString(), taskId: tid, shotId: sid },
    });
  };

  const displaySeconds = isRunning ? remainingSeconds : presetSeconds - elapsedSeconds;
  const isComplete = elapsedSeconds >= presetSeconds && !isRunning;

  return (
    <GlassCard>
      <View style={styles.container}>
        <Text style={styles.title}>Focus Timer</Text>

        {/* Preset selector */}
        <Pressable
          style={styles.presetRow}
          onPress={() => setShowPresetPicker(!showPresetPicker)}
        >
          <Text style={styles.presetLabel}>Duration</Text>
          <View style={styles.presetValue}>
            <Text style={styles.presetText}>
              {preset === '25m' ? '25 min' : preset === '45m' ? '45 min' : '60 min'}
            </Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </View>
        </Pressable>
        {showPresetPicker && (
          <View style={styles.pickerRow}>
            {(['25m', '45m', '60m'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.presetChip, preset === p && styles.presetChipActive]}
                onPress={() => {
                  setPreset(p);
                  setShowPresetPicker(false);
                }}
              >
                <Text style={[styles.presetChipText, preset === p && styles.presetChipTextActive]}>
                  {p === '25m' ? '25m' : p === '45m' ? '45m' : '60m'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Task selector */}
        <Pressable
          style={styles.taskRow}
          onPress={() => setShowTaskPicker(!showTaskPicker)}
        >
          <Text style={styles.taskLabel}>Task</Text>
          <Text style={styles.taskValue} numberOfLines={1}>
            {(selectedTask && ((selectedTask as { title?: string }).title ?? (selectedTask as { task_name?: string }).task_name)) ?? 'None (general focus)'}
          </Text>
        </Pressable>
        {showTaskPicker && (
          <View style={styles.taskList}>
            <TouchableOpacity
              style={styles.taskOption}
              onPress={() => {
                setTask(null, null);
                setShowTaskPicker(false);
              }}
            >
              <Text style={styles.taskOptionText}>None</Text>
            </TouchableOpacity>
            {tasks.slice(0, 5).map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.taskOption}
                onPress={() => {
                  setTask(t.id, t.shot_id);
                  setShowTaskPicker(false);
                }}
              >
                <Text style={styles.taskOptionText} numberOfLines={1}>
                  {(t as { title?: string }).title ?? (t as { task_name?: string }).task_name ?? 'Task'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Timer display */}
        <View style={styles.timerDisplay}>
          <Text style={styles.timerText}>
            {formatTime(isRunning ? remainingSeconds : Math.max(0, presetSeconds - elapsedSeconds))}
          </Text>
          {presetSeconds > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, progressPercent)}%`,
                    backgroundColor: isComplete ? colors.success : colors.accent,
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {!isRunning && elapsedSeconds === 0 && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleStart}>
              <Play size={24} color="#FFF" fill="#FFF" />
              <Text style={styles.primaryBtnText}>Start</Text>
            </TouchableOpacity>
          )}
          {isRunning && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handlePause}>
              <Pause size={24} color="#FFF" fill="#FFF" />
              <Text style={styles.primaryBtnText}>Pause</Text>
            </TouchableOpacity>
          )}
          {!isRunning && elapsedSeconds > 0 && (
            <>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleStart}>
                <Play size={20} color={colors.accent} />
                <Text style={styles.secondaryBtnText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleReset}>
                <Square size={20} color={colors.textSecondary} />
                <Text style={styles.secondaryBtnText}>Reset</Text>
              </TouchableOpacity>
            </>
          )}
          {(isRunning || elapsedSeconds > 0) && (
            <TouchableOpacity
              style={[styles.saveBtn, isRunning && styles.saveBtnDisabled]}
              onPress={handleStopWithSave}
              disabled={isRunning}
            >
              <Text style={styles.saveBtnText}>Stop & Save to Timesheet</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  presetValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
  },
  presetChipActive: {
    backgroundColor: colors.accent,
  },
  presetChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetChipTextActive: {
    color: '#FFF',
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  taskValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginLeft: 12,
    textAlign: 'right',
  },
  taskList: {
    gap: 4,
    marginBottom: 12,
  },
  taskOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
  },
  taskOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  timerDisplay: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  saveBtn: {
    flex: 1,
    minWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
