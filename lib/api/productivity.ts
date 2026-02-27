import { useQuery } from '@tanstack/react-query';
import { apiJson } from './client';

export interface ProductivitySnapshot {
  velocity_score: number;
  deadline_hit_rate: number;
  consistency_index: number;
  composite_score: number;
  period_start: string;
  period_end: string;
}

export interface TaskDetail {
  id: string;
  title: string;
  shot_code?: string;
  bid_hours: number;
  actual_hours: number;
  due_date: string | null;
  completed_at: string | null;
  status: string;
}

export interface ProductivityData {
  snapshot: ProductivitySnapshot;
  task_details: TaskDetail[];
}

interface ProductivityResponse {
  data: ProductivityData;
}

export function useProductivity() {
  return useQuery({
    queryKey: ['productivity'],
    queryFn: async (): Promise<ProductivityData> => {
      const res = await apiJson<ProductivityResponse>('/api/v1/mobile/productivity');
      return res.data;
    },
  });
}
