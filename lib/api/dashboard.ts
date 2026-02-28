import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export interface DashboardData {
  todayHours: number;
  weekHours: number;
  pendingCount: number;
  unreadCount: number;
  pendingTasks: Array<{
    id: string;
    title: string;
    due_date: string;
    status: string;
    shot_id: string;
  }>;
  todayTimeLogs: Array<{
    id: string;
    work_date: string;
    hours_worked: number;
    task_id: string | null;
  }>;
  pendingLeaves: Array<{
    id: string;
    start_date: string;
    end_date: string;
    status: string;
  }>;
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');

      const [tasksRes, todayLogsRes, weekLogsRes, leavesRes] = await Promise.all([
        supabase
          .from('shot_tasks')
          .select('id, title, due_date, status, shot_id')
          .eq('assigned_to', user.id)
          .in('status', [
            'Waiting to Start',
            'Ready to Start',
            'In Progress',
            'Pending Review',
            'On Hold',
            'Blocked',
          ])
          .order('due_date', { ascending: true })
          .limit(20),
        supabase
          .from('time_logs')
          .select('id, work_date, hours_worked, task_id')
          .eq('user_id', user.id)
          .gte('work_date', today)
          .lte('work_date', today),
        supabase
          .from('time_logs')
          .select('id, work_date, hours_worked, task_id')
          .eq('user_id', user.id)
          .gte('work_date', weekStart)
          .lte('work_date', weekEnd),
        supabase
          .from('leaves')
          .select('id, start_date, end_date, status')
          .eq('user_id', user.id)
          .eq('status', 'Pending')
          .gte('end_date', today),
      ]);

      const todayTimeLogs = todayLogsRes.data ?? [];
      const weekTimeLogs = weekLogsRes.data ?? [];
      const todayHours = todayTimeLogs.reduce((sum, t) => sum + (t.hours_worked || 0), 0);
      const weekHours = weekTimeLogs.reduce((sum, t) => sum + (t.hours_worked || 0), 0);
      const pendingTasks = tasksRes.data ?? [];
      const pendingLeaves = leavesRes.data ?? [];

      return {
        todayHours,
        weekHours,
        pendingCount: pendingTasks.length,
        unreadCount: 0,
        pendingTasks,
        todayTimeLogs,
        pendingLeaves,
      };
    },
  });
}
