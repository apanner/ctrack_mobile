/**
 * Authenticated API client for ctrack backend.
 * Uses Supabase session token as Bearer.
 */
import { supabase } from '../supabase';
import Constants from 'expo-constants';

const apiBaseUrl =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:3000';

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = `${apiBaseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  return fetch(url, { ...options, headers });
}

export async function apiJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await apiFetch(path, options);

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(res.ok ? 'Invalid JSON response' : text || res.statusText);
  }

  if (!res.ok) {
    const err = (data as { error?: string })?.error ?? res.statusText;
    throw new Error(typeof err === 'string' ? err : 'Request failed');
  }

  return data as T;
}
