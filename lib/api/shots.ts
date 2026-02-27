import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Shot } from '../../types';

export function useShots(filters?: {
  project_id?: string;
  artist_id?: string;
  status?: string;
  department?: string;
}) {
  return useQuery({
    queryKey: ['shots', filters],
    queryFn: async () => {
      // Query shots - we'll fetch artist info separately if needed
      let query = supabase
        .from('shots')
        .select('*')
        .order('due_date', { ascending: true });

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }
      if (filters?.artist_id) {
        query = query.eq('artist_id', filters.artist_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // If we have shots with artist_ids, fetch artist names
      const shotsWithArtists = data || [];
      const artistIds = [...new Set(shotsWithArtists.map((s: any) => s.artist_id).filter(Boolean))];
      
      let artistMap: Record<string, string> = {};
      if (artistIds.length > 0) {
        const { data: artists } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', artistIds);
        
        if (artists) {
          artistMap = artists.reduce((acc: Record<string, string>, artist: any) => {
            acc[artist.id] = artist.full_name;
            return acc;
          }, {});
        }
      }
      
      // Transform the data to include artist info
      return shotsWithArtists.map((shot: any) => ({
        ...shot,
        artist_name: shot.artist_id ? artistMap[shot.artist_id] || null : null,
      })) as Shot[];
    },
  });
}

export function useShot(id: string) {
  return useQuery({
    queryKey: ['shot', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shots')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Shot;
    },
    enabled: !!id,
  });
}

export function useUpdateShot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Shot> }) => {
      const { data, error } = await supabase
        .from('shots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Shot;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shots'] });
      queryClient.invalidateQueries({ queryKey: ['shot', data.id] });
    },
  });
}

