import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { apiJson } from './client';

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  deep_link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  data: NotificationEvent[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadCount: number;
}

export interface NotificationPreference {
  id: string;
  channel: string;
  enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  digest_mode: boolean;
  created_at: string;
  updated_at: string;
}

async function fetchNotifications(params?: {
  limit?: number;
  cursor?: string | null;
  unreadOnly?: boolean;
}): Promise<NotificationsResponse> {
  const search = new URLSearchParams();
  search.set('limit', String(params?.limit ?? 50));
  if (params?.cursor) search.set('cursor', params.cursor);
  if (params?.unreadOnly) search.set('unreadOnly', 'true');
  return apiJson<NotificationsResponse>(
    `/api/v1/mobile/notifications?${search.toString()}`
  );
}

async function markAsRead(ids: string | string[]): Promise<{ ok: boolean }> {
  const body =
    typeof ids === 'string' ? { id: ids } : { ids };
  return apiJson<{ ok: boolean }>('/api/v1/mobile/notifications/read', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function fetchPreferences(): Promise<NotificationPreference[]> {
  const res = await apiJson<{ data: NotificationPreference[] }>(
    '/api/v1/mobile/notifications/preferences'
  );
  return (res as { data: NotificationPreference[] }).data ?? [];
}

async function upsertPreferences(input: {
  channels?: Array<{ channel: string; enabled?: boolean }>;
  quiet_hours?: { start: string; end: string };
}): Promise<NotificationPreference[]> {
  const res = await apiJson<{ data: NotificationPreference[] }>(
    '/api/v1/mobile/notifications/preferences',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
  return (res as { data: NotificationPreference[] }).data ?? [];
}

async function registerPushToken(input: {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
}): Promise<{ data: unknown }> {
  return apiJson<{ data: unknown }>(
    '/api/v1/mobile/notifications/register-token',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
}

export function useNotifications(params?: {
  limit?: number;
  unreadOnly?: boolean;
}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => fetchNotifications(params),
  });
}

export function useNotificationsInfinite(unreadOnly?: boolean) {
  return useInfiniteQuery({
    queryKey: ['notifications', 'infinite', unreadOnly],
    queryFn: ({ pageParam }) =>
      fetchNotifications({
        limit: 50,
        cursor: pageParam,
        unreadOnly,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: null as string | null,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: fetchPreferences,
  });
}

export function useUpsertNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
}

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: registerPushToken,
  });
}
