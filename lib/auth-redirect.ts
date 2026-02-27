import { getHasSeenOnboarding } from './onboarding-storage';

/**
 * Returns the route to navigate to after successful auth.
 * Use when user is authenticated: show onboarding if first time, else tabs.
 */
export async function getPostAuthRoute(): Promise<'/(tabs)' | '/onboarding'> {
  const hasSeen = await getHasSeenOnboarding();
  return hasSeen ? '/(tabs)' : '/onboarding';
}
