import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onlineManager } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { apiJson } from './client';
import { startOfWeek, format } from 'date-fns';
import { addToQueue } from '../offline-queue';

export type EntryType = 'work' | 'training' | 'downtime' | 'power_outage';

export interface TimeLog {
  id: string;
  work_date: string;
  hours_worked: number;
  project_id: string | null;
  shot_id: string | null;
  task_id: string | null;
  notes: string | null;
  entry_type?: EntryType | null;
}

interface CreateTimeLogPayload {
  workDate: string;
  projectId?: string | null;
  shotId?: string | null;
  taskId?: string | null;
  hoursWorked: number;
  notes?: string | null;
  entryType?: EntryType;
}

export function useTimesheets(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['timesheets', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('time_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('work_date', { ascending: false })
        .limit(50);

      if (startDate) query = query.gte('work_date', startDate);
      if (endDate) query = query.lte('work_date', endDate);

      const { data, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as TimeLog[], total: data?.length ?? 0 };
    },
  });
}

/** Copy time logs from one date to another. Creates new entries via API. */
export function useCopyDayToDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      toDate,
      entries,
    }: {
      toDate: string;
      entries: TimeLog[];
    }) => {
      const isOffline = !onlineManager.isOnline();
      const results: (TimeLog & { _pending?: boolean })[] = [];
      for (const e of entries) {
        const body = {
          workDate: toDate,
          projectId: e.project_id ?? null,
          shotId: e.shot_id ?? null,
          taskId: e.task_id ?? null,
          hoursWorked: e.hours_worked,
          notes: e.notes ?? null,
          entryType: (e.entry_type as EntryType) ?? 'work',
        };
        if (isOffline) {
          const item = addToQueue(
            { type: 'timesheet', payload: body },
            queryClient
          );
          results.push({
            id: item.id,
            work_date: toDate,
            hours_worked: e.hours_worked,
            project_id: e.project_id ?? null,
            shot_id: e.shot_id ?? null,
            task_id: e.task_id ?? null,
            notes: e.notes ?? null,
            entry_type: (e.entry_type as EntryType) ?? 'work',
            _pending: true,
          });
        } else {
          try {
            const res = await apiJson<{ data: TimeLog }>('/api/v1/mobile/timesheets', {
              method: 'POST',
              body: JSON.stringify(body),
            });
            results.push(res.data);
          } catch (err) {
            if (isNetworkError(err)) {
              const item = addToQueue(
                { type: 'timesheet', payload: body },
                queryClient
              );
              results.push({
                id: item.id,
                work_date: toDate,
                hours_worked: e.hours_worked,
                project_id: e.project_id ?? null,
                shot_id: e.shot_id ?? null,
                task_id: e.task_id ?? null,
                notes: e.notes ?? null,
                entry_type: (e.entry_type as EntryType) ?? 'work',
                _pending: true,
              });
            } else throw err;
          }
        }
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-week-status'] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-weekly-report'] });
      queryClient.invalidateQueries({ queryKey: ['offline-queue'] });
    },
  });
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message?.toLowerCase().includes('fetch')) return true;
  if (err instanceof Error) {
    const msg = err.message?.toLowerCase() ?? '';
    return msg.includes('network') || msg.includes('failed to fetch') || msg.includes('aborted');
  }
  return false;
}

export function useCreateTimeLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTimeLogPayload) => {
      const body = {
        workDate: payload.workDate,
        projectId: payload.projectId ?? null,
        shotId: payload.shotId ?? null,
        taskId: payload.taskId ?? null,
        hoursWorked: payload.hoursWorked,
        notes: payload.notes ?? null,
        entryType: payload.entryType ?? 'work',
      };
      const isOffline = !onlineManager.isOnline();
      if (isOffline) {
        const item = addToQueue(
          { type: 'timesheet', payload: body },
          queryClient
        );
        return {
          id: item.id,
          work_date: payload.workDate,
          hours_worked: payload.hoursWorked,
          project_id: payload.projectId ?? null,
          shot_id: payload.shotId ?? null,
          task_id: payload.taskId ?? null,
          notes: payload.notes ?? null,
          entry_type: payload.entryType ?? 'work',
          _pending: true,
        } as TimeLog & { _pending?: boolean };
      }
      try {
        const res = await apiJson<{ data: TimeLog }>('/api/v1/mobile/timesheets', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return res.data;
      } catch (err) {
        if (isNetworkError(err)) {
          const item = addToQueue(
            { type: 'timesheet', payload: body },
            queryClient
          );
          return {
            id: item.id,
            work_date: payload.workDate,
            hours_worked: payload.hoursWorked,
            project_id: payload.projectId ?? null,
            shot_id: payload.shotId ?? null,
            task_id: payload.taskId ?? null,
            notes: payload.notes ?? null,
            entry_type: payload.entryType ?? 'work',
            _pending: true,
          } as TimeLog & { _pending?: boolean };
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-week-status'] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-weekly-report'] });
      queryClient.invalidateQueries({ queryKey: ['offline-queue'] });
    },
  });
}

/** Get Monday (week start) for a date. */
export function getWeekStart(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const monday = startOfWeek(d, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

interface WeekStatusResponse {
  submitted: boolean;
  submittedAt?: string;
}

export function useWeekStatus(weekStart: string | undefined) {
  return useQuery({
    queryKey: ['timesheet-week-status', weekStart],
    queryFn: async () => {
      if (!weekStart) throw new Error('weekStart required');
      const res = await apiJson<WeekStatusResponse>(
        `/api/v1/mobile/timesheets/week-status?weekStart=${encodeURIComponent(weekStart)}`
      );
      return res;
    },
    enabled: !!weekStart,
  });
}

export function useSubmitWeek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (weekStartDate: string) => {
      await apiJson<{ data: unknown }>('/api/v1/mobile/timesheets/submit-week', {
        method: 'POST',
        body: JSON.stringify({ weekStartDate }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet-week-status'] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-weekly-report'] });
    },
  });
}

export interface WeeklyReportProject {
  projectId: string | null;
  projectName: string;
  hours: number;
}

export interface WeeklyReportEntryType {
  type: string;
  hours: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  byProject: WeeklyReportProject[];
  byEntryType: WeeklyReportEntryType[];
}

export function useWeeklyReport(weekStart: string | undefined) {
  return useQuery({
    queryKey: ['timesheet-weekly-report', weekStart],
    queryFn: async (): Promise<WeeklyReport> => {
      if (!weekStart) throw new Error('weekStart required');
      const res = await apiJson<WeeklyReport>(
        `/api/v1/mobile/timesheets/weekly-report?weekStart=${encodeURIComponent(weekStart)}`
      );
      return res;
    },
    enabled: !!weekStart,
  });
}
