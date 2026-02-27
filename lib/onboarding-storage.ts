import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'ctrack-mobile-hasSeenOnboarding';

export async function getHasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setHasSeenOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Failed to save onboarding state:', error);
  }
}
