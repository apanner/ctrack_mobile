import { Stack } from 'expo-router';
import { colors } from '../../constants/colors';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="pwa-install" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
