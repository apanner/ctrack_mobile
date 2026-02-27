import { useQuery } from '@tanstack/react-query';
import { apiJson } from './client';

export interface Motivation {
  id: string;
  message: string;
  author_type: string;
  target_date: string;
}

interface MotivationsResponse {
  data: Motivation[];
}

export function useMotivations() {
  return useQuery({
    queryKey: ['motivations'],
    queryFn: async (): Promise<Motivation[]> => {
      const res = await apiJson<MotivationsResponse>('/api/v1/mobile/motivations');
      return res.data ?? [];
    },
  });
}
