import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_CONSENT_KEY = 'ctrack-mobile-location-consent';
const LOCATION_PAUSED_KEY = 'ctrack-mobile-location-paused';
const LAST_SYNC_KEY = 'ctrack-mobile-location-last-sync';

export async function getLocationConsent(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(LOCATION_CONSENT_KEY);
    return v === 'true';
  } catch {
    return false;
  }
}

export async function setLocationConsent(consented: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCATION_CONSENT_KEY, consented ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save location consent:', e);
  }
}

export async function getLocationPaused(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(LOCATION_PAUSED_KEY);
    return v === 'true';
  } catch {
    return false;
  }
}

export async function setLocationPaused(paused: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCATION_PAUSED_KEY, paused ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save location paused:', e);
  }
}

export async function getLastSyncAt(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

export async function setLastSyncAt(isoString: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, isoString);
  } catch (e) {
    console.error('Failed to save last sync:', e);
  }
}
