import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

export const FOCUS_PRESETS = {
  '25m': 25 * 60,
  '45m': 45 * 60,
  '60m': 60 * 60,
} as const;

export type FocusPreset = keyof typeof FOCUS_PRESETS;

export interface FocusTimerState {
  isRunning: boolean;
  elapsedSeconds: number;
  presetSeconds: number;
  taskId: string | null;
  shotId: string | null;
  startedAt: Date | null;
  draftTimeLogId: string | null;
}

interface FocusTimerContextValue extends FocusTimerState {
  preset: FocusPreset;
  setPreset: (p: FocusPreset) => void;
  setTask: (taskId: string | null, shotId?: string | null) => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  remainingSeconds: number;
  progressPercent: number;
}

const DEFAULT_STATE: FocusTimerState = {
  isRunning: false,
  elapsedSeconds: 0,
  presetSeconds: FOCUS_PRESETS['25m'],
  taskId: null,
  shotId: null,
  startedAt: null,
  draftTimeLogId: null,
};

const FocusTimerContext = createContext<FocusTimerContextValue | null>(null);

export function FocusTimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FocusTimerState>(DEFAULT_STATE);
  const [preset, setPresetState] = useState<FocusPreset>('25m');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setPreset = useCallback((p: FocusPreset) => {
    setPresetState(p);
    setState((s) => ({
      ...s,
      presetSeconds: FOCUS_PRESETS[p],
      ...(s.elapsedSeconds >= FOCUS_PRESETS[p] ? { elapsedSeconds: FOCUS_PRESETS[p] } : {}),
    }));
  }, []);

  const setTask = useCallback((taskId: string | null, shotId?: string | null) => {
    setState((s) => ({ ...s, taskId, shotId: shotId ?? s.shotId }));
  }, []);

  const start = useCallback(() => {
    setState((s) => ({
      ...s,
      isRunning: true,
      startedAt: s.startedAt || new Date(),
    }));
  }, []);

  const pause = useCallback(() => {
    setState((s) => ({ ...s, isRunning: false }));
  }, []);

  const stop = useCallback(() => {
    setState((s) => ({ ...s, isRunning: false, startedAt: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      ...DEFAULT_STATE,
      presetSeconds: FOCUS_PRESETS[preset],
      taskId: state.taskId,
      shotId: state.shotId,
    });
  }, [preset, state.taskId, state.shotId]);

  // Tick when running
  useEffect(() => {
    if (!state.isRunning) return;
    intervalRef.current = setInterval(() => {
      setState((s) => {
        const next = s.elapsedSeconds + 1;
        const max = s.presetSeconds;
        return {
          ...s,
          elapsedSeconds: Math.min(next, max),
          ...(next >= max ? { isRunning: false } : {}),
        };
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning]);

  // Sync elapsed when resumed (e.g. after app background)
  useEffect(() => {
    if (!state.isRunning || !state.startedAt) return;
    const elapsed = Math.floor((Date.now() - state.startedAt.getTime()) / 1000);
    setState((s) => ({ ...s, elapsedSeconds: Math.min(elapsed, s.presetSeconds) }));
  }, [state.isRunning, state.startedAt]);

  const presetSeconds = state.presetSeconds;
  const remainingSeconds = Math.max(0, presetSeconds - state.elapsedSeconds);
  const progressPercent = presetSeconds > 0 ? (state.elapsedSeconds / presetSeconds) * 100 : 0;

  const value: FocusTimerContextValue = {
    ...state,
    preset,
    setPreset,
    setTask,
    start,
    pause,
    stop,
    reset,
    remainingSeconds,
    progressPercent,
  };

  return (
    <FocusTimerContext.Provider value={value}>{children}</FocusTimerContext.Provider>
  );
}

export function useFocusTimer() {
  const ctx = useContext(FocusTimerContext);
  if (!ctx) throw new Error('useFocusTimer must be used within FocusTimerProvider');
  return ctx;
}
