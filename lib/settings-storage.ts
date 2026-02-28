/**
 * Settings preferences stored in AsyncStorage.
 * Can be migrated to API later.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'ctrack_settings_';

export interface NotificationSettings {
  chatSounds: boolean;
  taskAlerts: boolean;
  leaveUpdates: boolean;
  timesheetReminders: boolean;
  notificationSound: 'default' | 'chime' | 'gentle' | 'none';
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface ChatSettings {
  chatSendSound: boolean;
  chatReceiveSound: boolean;
}

export interface PwaSettings {
  installPromptDismissed: boolean;
  pwaInstalled: boolean;
}

const NOTIFICATION_DEFAULTS: NotificationSettings = {
  chatSounds: true,
  taskAlerts: true,
  leaveUpdates: true,
  timesheetReminders: true,
  notificationSound: 'default',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

const CHAT_DEFAULTS: ChatSettings = {
  chatSendSound: true,
  chatReceiveSound: true,
};

const PWA_DEFAULTS: PwaSettings = {
  installPromptDismissed: false,
  pwaInstalled: false,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const raw = await AsyncStorage.getItem(`${PREFIX}notifications`);
  if (!raw) return { ...NOTIFICATION_DEFAULTS };
  try {
    return { ...NOTIFICATION_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...NOTIFICATION_DEFAULTS };
  }
}

export async function setNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  const current = await getNotificationSettings();
  const next = { ...current, ...settings };
  await AsyncStorage.setItem(`${PREFIX}notifications`, JSON.stringify(next));
}

export async function getChatSettings(): Promise<ChatSettings> {
  const raw = await AsyncStorage.getItem(`${PREFIX}chat`);
  if (!raw) return { ...CHAT_DEFAULTS };
  try {
    return { ...CHAT_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...CHAT_DEFAULTS };
  }
}

export async function setChatSettings(settings: Partial<ChatSettings>): Promise<void> {
  const current = await getChatSettings();
  const next = { ...current, ...settings };
  await AsyncStorage.setItem(`${PREFIX}chat`, JSON.stringify(next));
}

export async function getPwaSettings(): Promise<PwaSettings> {
  const raw = await AsyncStorage.getItem(`${PREFIX}pwa`);
  if (!raw) return { ...PWA_DEFAULTS };
  try {
    return { ...PWA_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...PWA_DEFAULTS };
  }
}

export async function setPwaSettings(settings: Partial<PwaSettings>): Promise<void> {
  const current = await getPwaSettings();
  const next = { ...current, ...settings };
  await AsyncStorage.setItem(`${PREFIX}pwa`, JSON.stringify(next));
}
