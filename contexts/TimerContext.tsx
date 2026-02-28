import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ActiveTimer {
  shotCode: string;
  taskName: string;
  startedAt: Date;
}

interface TimerContextValue {
  activeTimer: ActiveTimer | null;
  setActiveTimer: (timer: ActiveTimer | null) => void;
  elapsed: string;
  elapsedMs: number;
}

const TimerContext = createContext<TimerContextValue | null>(null);

function formatElapsed(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatElapsedHMS(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':');
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimer, setActiveTimerState] = useState<ActiveTimer | null>(null);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (!activeTimer) return;
    const start = activeTimer.startedAt.getTime();
    const tick = () => setElapsedMs(Date.now() - start);
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTimer]);

  const setActiveTimer = useCallback((timer: ActiveTimer | null) => {
    setActiveTimerState(timer);
    setElapsedMs(0);
  }, []);

  const elapsed = activeTimer ? formatElapsed(elapsedMs) : '';

  return (
    <TimerContext.Provider value={{ activeTimer, setActiveTimer, elapsed, elapsedMs }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}

export function useTimerPill() {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    return {
      visible: false,
      shotCode: '',
      taskName: '',
      elapsed: '',
      onPause: () => {},
      onStop: () => {},
    };
  }
  const { activeTimer, setActiveTimer, elapsed } = ctx;
  return {
    visible: !!activeTimer,
    shotCode: activeTimer?.shotCode ?? '',
    taskName: activeTimer?.taskName ?? '',
    elapsed,
    onPause: () => {},
    onStop: () => setActiveTimer(null),
  };
}
