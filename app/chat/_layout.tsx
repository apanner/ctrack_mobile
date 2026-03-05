import { Stack } from 'expo-router';
import { colors } from '../../constants/colors';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Chat', headerShown: true }} />
      <Stack.Screen name="[roomId]" options={{ title: 'Chat', headerShown: false }} />
    </Stack>
  );
}
