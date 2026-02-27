import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiJson } from './api/client';

const QUEUE_KEY = 'ctrack-mobile-offline-queue';

export interface TimesheetPayload {
  workDate: string;
  projectId?: string | null;
  shotId?: string | null;
  taskId?: string | null;
  hoursWorked: number;
  notes?: string | null;
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

export function addToQueue(mutation: Omit<QueueItem, 'id' | 'createdAt'>): QueueItem {
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
        await apiJson<{ data: unknown }>('/api/v1/mobile/timesheets', {
          method: 'POST',
          body: JSON.stringify(item.payload),
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
