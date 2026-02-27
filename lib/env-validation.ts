/**
 * Startup env validation for ctrack_mobile.
 * Warns if EXPO_PUBLIC_API_URL is localhost when not in dev mode.
 */

declare const __DEV__: boolean | undefined;

function isDev(): boolean {
  if (typeof __DEV__ !== 'undefined') return __DEV__;
  return process.env.NODE_ENV === 'development';
}

export function validateEnv(): void {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
  const isLocalhost =
    apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');

  if (isLocalhost && !isDev()) {
    console.warn(
      '[ctrack_mobile] EXPO_PUBLIC_API_URL points to localhost in non-dev build. ' +
        'Update .env for production.'
    );
  }

  if (!apiUrl && !isDev()) {
    console.warn(
      '[ctrack_mobile] EXPO_PUBLIC_API_URL is not set. API calls may fail.'
    );
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  if (!supabaseUrl) {
    console.warn(
      '[ctrack_mobile] EXPO_PUBLIC_SUPABASE_URL is not set. Auth and data may fail.'
    );
  }
}
