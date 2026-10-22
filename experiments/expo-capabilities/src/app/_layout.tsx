import { Stack } from 'expo-router';

import { ProfileProvider } from '@/profile-context';

export default function RootLayout() {
  return (
    <ProfileProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="diners" options={{ headerShown: false }} />
        <Stack.Screen
          name="capabilities"
          options={{
            headerBackTitle: '菜谱',
            headerStyle: { backgroundColor: '#FFF8EE' },
            headerTintColor: '#44372F',
            title: '从截图导入菜谱',
          }}
        />
      </Stack>
    </ProfileProvider>
  );
}
