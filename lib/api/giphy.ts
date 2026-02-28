/**
 * Giphy API for GIF search.
 * Requires EXPO_PUBLIC_GIPHY_API_KEY in env.
 */

const GIPHY_API_KEY = process.env.EXPO_PUBLIC_GIPHY_API_KEY;
const GIPHY_BASE = 'https://api.giphy.com/v1/gifs';

export interface GiphyGif {
  id: string;
  url: string;
  title: string;
  images: {
    fixed_height: { url: string; width: string; height: string };
    fixed_height_small: { url: string };
    original: { url: string };
  };
}

export interface GiphySearchResponse {
  data: Array<{
    id: string;
    title: string;
    images: {
      fixed_height: { url: string; width: string; height: string };
      fixed_height_small: { url: string };
      original: { url: string };
    };
  }>;
  pagination: { total_count: number; count: number; offset: number };
}

export function hasGiphyApiKey(): boolean {
  return Boolean(GIPHY_API_KEY && GIPHY_API_KEY.length > 0);
}

export async function searchGiphy(
  query: string,
  options?: { limit?: number; offset?: number }
): Promise<GiphySearchResponse> {
  if (!GIPHY_API_KEY) {
    throw new Error('EXPO_PUBLIC_GIPHY_API_KEY is not set. Add it to enable GIF search.');
  }

  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    q: query.trim() || 'happy',
    limit: String(options?.limit ?? 20),
  });
  if (options?.offset) params.set('offset', String(options.offset));

  const res = await fetch(`${GIPHY_BASE}/search?${params.toString()}`);
  if (!res.ok) throw new Error('Giphy search failed');

  return res.json() as Promise<GiphySearchResponse>;
}

export async function getTrendingGifs(
  options?: { limit?: number; offset?: number }
): Promise<GiphySearchResponse> {
  if (!GIPHY_API_KEY) {
    throw new Error('EXPO_PUBLIC_GIPHY_API_KEY is not set.');
  }

  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    limit: String(options?.limit ?? 20),
  });
  if (options?.offset) params.set('offset', String(options.offset));

  const res = await fetch(`${GIPHY_BASE}/trending?${params.toString()}`);
  if (!res.ok) throw new Error('Giphy trending failed');

  return res.json() as Promise<GiphySearchResponse>;
}
