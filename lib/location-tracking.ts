/**
 * GPS location tracking for ctrack_mobile.
 * Policy: moving (speed > 1.5 km/h) = 30s poll, stationary = 30 min, shift ended = heartbeat.
 * Batch upload: every 5 points or every 60s.
 */

import * as Location from 'expo-location';
import { apiJson } from './api/client';
import { getLocationConsent, getLocationPaused, setLastSyncAt } from './location-consent-storage';

const SPEED_MOVING_THRESHOLD_MS = 1.5 / 3.6; // 1.5 km/h in m/s
const POLL_INTERVAL_MOVING_MS = 30 * 1000; // 30s
const POLL_INTERVAL_STATIONARY_MS = 30 * 60 * 1000; // 30 min
const BATCH_MAX_POINTS = 5;
const BATCH_MAX_AGE_MS = 60 * 1000; // 60s
const STATIONARY_DISTANCE_METERS = 25; // points within 25m treated as stationary

export interface LocationPoint {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  battery?: number;
  captured_at: string;
  motion_state: 'moving' | 'stationary' | 'unknown';
}

let pollTimer: ReturnType<typeof setInterval> | null = null;
let batchBuffer: LocationPoint[] = [];
let batchFirstAt: number | null = null;
let lastPoint: LocationPoint | null = null;
let uploadInFlight = false;

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in m
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function inferMotionState(point: LocationPoint): 'moving' | 'stationary' | 'unknown' {
  if (point.speed != null && point.speed > SPEED_MOVING_THRESHOLD_MS) {
    return 'moving';
  }
  if (lastPoint) {
    const dist = haversineMeters(
      lastPoint.lat,
      lastPoint.lng,
      point.lat,
      point.lng
    );
    if (dist < STATIONARY_DISTANCE_METERS) {
      return 'stationary';
    }
  }
  return 'unknown';
}

async function uploadBatch(): Promise<void> {
  if (batchBuffer.length === 0 || uploadInFlight) return;

  const toUpload = [...batchBuffer];
  batchBuffer = [];
  batchFirstAt = null;
  uploadInFlight = true;

  try {
    await apiJson<{ inserted: number }>('/api/v1/mobile/location/batch', {
      method: 'POST',
      body: JSON.stringify({ points: toUpload }),
    });
    await setLastSyncAt(new Date().toISOString());
  } catch (e) {
    console.warn('Location batch upload failed:', e);
    batchBuffer = [...toUpload, ...batchBuffer];
    batchFirstAt = batchBuffer.length > 0 ? Date.now() : null;
  } finally {
    uploadInFlight = false;
  }
}

function maybeFlushBatch(): void {
  const now = Date.now();
  const age = batchFirstAt != null ? now - batchFirstAt : 0;
  const shouldFlush =
    batchBuffer.length >= BATCH_MAX_POINTS || (batchBuffer.length > 0 && age >= BATCH_MAX_AGE_MS);
  if (shouldFlush) {
    void uploadBatch();
  }
}

async function captureAndEnqueue(): Promise<void> {
  const consented = await getLocationConsent();
  const paused = await getLocationPaused();
  if (!consented || paused) return;

  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return;
  } catch {
    return;
  }

  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords = loc.coords;
    const point: LocationPoint = {
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: coords.accuracy ?? undefined,
      speed: coords.speed ?? undefined,
      heading: coords.heading ?? undefined,
      battery: undefined, // Requires expo-battery if needed
      captured_at: new Date().toISOString(),
      motion_state: 'unknown',
    };

    point.motion_state = inferMotionState(point);
    lastPoint = point;

    batchBuffer.push(point);
    if (batchFirstAt == null) batchFirstAt = Date.now();
    maybeFlushBatch();

    const isMoving =
      point.speed != null && point.speed > SPEED_MOVING_THRESHOLD_MS;
    return scheduleNext(isMoving ? 'moving' : 'stationary');
  } catch (e) {
    console.warn('Location capture failed:', e);
    return scheduleNext('stationary');
  }
}

function scheduleNext(state: 'moving' | 'stationary'): void {
  if (pollTimer) clearInterval(pollTimer);
  const interval =
    state === 'moving' ? POLL_INTERVAL_MOVING_MS : POLL_INTERVAL_STATIONARY_MS;
  pollTimer = setInterval(() => void captureAndEnqueue(), interval);
}

/**
 * Request foreground location permission. Call before starting tracking.
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status: existing } = await Location.getForegroundPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Check if we have foreground location permission.
 */
export async function hasLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Start adaptive location tracking. Requires consent and permission.
 * Call after user has consented and permission is granted.
 */
export async function startLocationTracking(): Promise<boolean> {
  const consented = await getLocationConsent();
  const paused = await getLocationPaused();
  if (!consented || paused) return false;

  const granted = await requestLocationPermission();
  if (!granted) return false;

  void captureAndEnqueue();
  return true;
}

/**
 * Stop location tracking.
 */
export function stopLocationTracking(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (batchBuffer.length > 0) {
    void uploadBatch();
  }
  lastPoint = null;
  batchBuffer = [];
  batchFirstAt = null;
}

/**
 * Resume tracking if paused. Call when user toggles pause off.
 */
export function resumeLocationTracking(): void {
  void captureAndEnqueue();
}
