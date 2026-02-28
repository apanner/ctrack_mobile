/**
 * Notification sound playback.
 * Uses expo-audio on native, Web Audio API on web.
 */
import { Platform } from 'react-native';

// Remote sound URLs — short notification tones (public domain / free use)
const SOUND_URLS = {
  default:
    'https://assets.mixkit.co/active_storage/sfx/2869-pristine-610.mp3',
  chime:
    'https://assets.mixkit.co/active_storage/sfx/2568-minimal-notification-2568.mp3',
  gentle:
    'https://assets.mixkit.co/active_storage/sfx/2867-melodic-notification-2867.mp3',
} as const;

type SoundType = 'default' | 'chime' | 'gentle';

let cachedPlayers: Record<string, HTMLAudioElement | null> = {};

function playOnWeb(type: SoundType): void {
  const url = SOUND_URLS[type];
  try {
    const audio = new Audio(url);
    audio.volume = 0.7;
    audio.play().catch(() => {
      // Autoplay may be blocked; ignore
    });
  } catch {
    // Fallback silent
  }
}

async function playOnNative(type: SoundType): Promise<void> {
  try {
    const { createAudioPlayer } = await import('expo-audio');
    const url = SOUND_URLS[type];
    const player = createAudioPlayer({ uri: url });
    player.play();
  } catch {
    // Fallback: try web API if we're in a webview
    if (typeof window !== 'undefined') {
      playOnWeb(type);
    }
  }
}

export function playNotificationSound(type: SoundType | 'none'): void {
  if (type === 'none') return;

  if (Platform.OS === 'web') {
    playOnWeb(type);
    return;
  }

  playOnNative(type);
}

export function playChatSound(kind: 'send' | 'receive'): void {
  playNotificationSound(kind === 'send' ? 'chime' : 'gentle');
}
