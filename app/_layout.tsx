// app/_layout.tsx

import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  // アプリ全体をSafeAreaProviderで囲む
  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
  );
}
