import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiJson } from './client';
import { supabase } from '../supabase';

export interface ChatRoom {
  id: string;
  name: string;
  room_type: 'project' | 'department' | 'team' | 'direct';
  project_id: string | null;
  department_id: string | null;
  created_by: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatRoomWithMeta extends ChatRoom {
  last_message?: { content: string; created_at: string } | null;
  unread_count?: number;
  member_count?: number;
  sender_profile?: { full_name: string } | null;
}

export interface ChatAttachment {
  id: string;
  s3_key: string;
  mime_type: string;
  file_name: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  reply_to_id: string | null;
  attachment_id: string | null;
  created_at: string;
  updated_at: string;
  sender_profile?: { full_name: string } | null;
  attachment?: ChatAttachment | null;
}

async function fetchRooms(): Promise<ChatRoomWithMeta[]> {
  const res = await apiJson<{ data: ChatRoomWithMeta[] }>('/api/v1/mobile/chat/rooms');
  return res.data ?? [];
}

async function fetchRoom(roomId: string): Promise<ChatRoom> {
  const res = await apiJson<{ data: ChatRoom }>(`/api/v1/mobile/chat/rooms/${roomId}`);
  return res.data;
}

async function fetchMessages(
  roomId: string,
  params?: { limit?: number; before?: string }
): Promise<ChatMessage[]> {
  const search = new URLSearchParams();
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.before) search.set('before', params.before);
  const qs = search.toString();
  const res = await apiJson<{ data: ChatMessage[] }>(
    `/api/v1/mobile/chat/rooms/${roomId}/messages${qs ? `?${qs}` : ''}`
  );
  return res.data ?? [];
}

async function sendMessageApi(
  roomId: string,
  content: string,
  attachmentId?: string
): Promise<ChatMessage> {
  const res = await apiJson<{ data: ChatMessage }>(
    `/api/v1/mobile/chat/rooms/${roomId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content, attachmentId }),
    }
  );
  return res.data;
}

async function createRoom(params: {
  type: 'direct' | 'project';
  otherUserId?: string;
  projectId?: string;
}): Promise<ChatRoom> {
  const res = await apiJson<{ data: ChatRoom }>('/api/v1/mobile/chat/rooms', {
    method: 'POST',
    body: JSON.stringify({
      type: params.type,
      otherUserId: params.otherUserId,
      projectId: params.projectId,
    }),
  });
  return res.data;
}

export function useChatRooms() {
  return useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: fetchRooms,
  });
}

export function useChatRoom(roomId: string | null) {
  return useQuery({
    queryKey: ['chat', 'room', roomId],
    queryFn: () => fetchRoom(roomId!),
    enabled: !!roomId,
  });
}

export function useChatMessages(roomId: string | null, limit = 50) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['chat', 'messages', roomId],
    queryFn: ({ pageParam }) =>
      fetchMessages(roomId!, { limit, before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === limit ? lastPage[0]?.id : undefined,
    enabled: !!roomId,
  });

  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat', 'messages', roomId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  const messages =
    [...(query.data?.pages ?? [])].reverse().flat() ?? [];
  return { ...query, data: messages };
}

export function useSendMessage(roomId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, attachmentId }: { content: string; attachmentId?: string }) =>
      sendMessageApi(roomId!, content, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', roomId!] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', roomId!] });
    },
  });
}

export function useCreateChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
    },
  });
}

