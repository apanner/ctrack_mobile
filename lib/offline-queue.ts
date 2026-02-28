import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, type QueryClient } from '@tanstack/react-query';
import { apiJson } from './api/client';

const QUEUE_KEY = 'ctrack-mobile-offline-queue';

export type EntryType = 'work' | 'training' | 'downtime' | 'power_outage';

export interface TimesheetPayload {
  workDate: string;
  projectId?: string | null;
  shotId?: string | null;
  taskId?: string | null;
  hoursWorked: number;
  notes?: string | null;
  entryType?: EntryType;
}

export interface QueueItem {
  id: string;
  type: 'timesheet';
  payload: TimesheetPayload;
  createdAt: number;
}

async function loadQueue(): Promise<QueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueueItem[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function addToQueue(
  mutation: Omit<QueueItem, 'id' | 'createdAt'>,
  queryClient?: QueryClient
): QueueItem {
  const item: QueueItem = {
    ...mutation,
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
  };
  loadQueue()
    .then((q) => {
      q.push(item);
      return saveQueue(q);
    })
    .then(() => {
      queryClient?.invalidateQueries({ queryKey: ['offline-queue'] });
    })
    .catch(console.error);
  return item;
}

export async function getQueue(): Promise<QueueItem[]> {
  return loadQueue();
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await loadQueue();
  const filtered = queue.filter((i) => i.id !== id);
  await saveQueue(filtered);
}

export async function flushQueue(): Promise<{ success: number; failed: QueueItem[] }> {
  const queue = await loadQueue();
  let success = 0;
  const failed: QueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'timesheet') {
        const p = item.payload;
        await apiJson<{ data: unknown }>('/api/v1/mobile/timesheets', {
          method: 'POST',
          body: JSON.stringify({
            workDate: p.workDate,
            projectId: p.projectId ?? null,
            shotId: p.shotId ?? null,
            taskId: p.taskId ?? null,
            hoursWorked: p.hoursWorked,
            notes: p.notes ?? null,
            entryType: p.entryType ?? 'work',
          }),
        });
        await removeFromQueue(item.id);
        success += 1;
      }
    } catch (err) {
      console.error('Offline queue flush failed for', item.id, err);
      failed.push(item);
    }
  }

  return { success, failed };
}

/** Hook to read offline queue. Invalidates when queue changes. */
export function useOfflineQueue() {
  return useQuery({
    queryKey: ['offline-queue'],
    queryFn: getQueue,
    staleTime: 1000,
  });
}

/** Filter queue items for a given work date. */
export function filterQueueByDate(queue: QueueItem[], workDate: string): QueueItem[] {
  return queue.filter((i) => i.type === 'timesheet' && i.payload.workDate === workDate);
}
