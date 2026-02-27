import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from './client';

export interface Leave {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  leave_type?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeavesResponse {
  data: Leave[];
}

export interface CreateLeaveInput {
  startDate: string;
  endDate: string;
  type?: string;
  notes?: string | null;
}

async function fetchLeaves(params?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<Leave[]> {
  const search = new URLSearchParams();
  if (params?.startDate) search.set('startDate', params.startDate);
  if (params?.endDate) search.set('endDate', params.endDate);
  if (params?.status) search.set('status', params.status);
  const qs = search.toString();
  const res = await apiJson<LeavesResponse>(`/api/v1/mobile/leaves${qs ? `?${qs}` : ''}`);
  return (res as LeavesResponse).data ?? [];
}

async function createLeave(input: CreateLeaveInput): Promise<Leave> {
  const res = await apiJson<{ data: Leave }>('/api/v1/mobile/leaves', {
    method: 'POST',
    body: JSON.stringify({
      startDate: input.startDate,
      endDate: input.endDate,
      type: input.type ?? 'Annual',
      notes: input.notes ?? null,
    }),
  });
  return (res as { data: Leave }).data;
}

export function useLeaves(params?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['leaves', params],
    queryFn: () => fetchLeaves(params),
  });
}

export function useSubmitLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });
}
