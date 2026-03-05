import { Stack } from 'expo-router';
import { colors } from '../../../constants/colors';

export default function ShotsLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Shots', headerShown: true }} />
      <Stack.Screen name="[shotId]" options={{ title: 'Shot Details', headerShown: true }} />
    </Stack>
  );
}
