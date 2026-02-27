import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export interface TimeLog {
  id: string;
  work_date: string;
  hours_worked: number;
  project_id: string | null;
  shot_id: string | null;
  task_id: string | null;
  notes: string | null;
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

interface CreateTimeLogPayload {
  workDate: string;
  projectId?: string;
  shotId?: string;
  taskId?: string;
  hoursWorked: number;
  notes?: string;
}

export function useCreateTimeLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTimeLogPayload) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('time_logs')
        .insert({
          user_id: user.id,
          work_date: payload.workDate,
          project_id: payload.projectId ?? null,
          shot_id: payload.shotId ?? null,
          task_id: payload.taskId ?? null,
          hours_worked: payload.hoursWorked,
          notes: payload.notes ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TimeLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
