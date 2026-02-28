import { useCallback } from 'react';
import { getChatSettings } from '../lib/settings-storage';
import { playChatSound } from '../lib/notification-sounds';

export function useChatSounds() {
  const playSendSound = useCallback(async () => {
    const s = await getChatSettings();
    if (s.chatSendSound) playChatSound('send');
  }, []);

  const playReceiveSound = useCallback(async () => {
    const s = await getChatSettings();
    if (s.chatReceiveSound) playChatSound('receive');
  }, []);

  return { playSendSound, playReceiveSound };
}
