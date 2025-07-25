// app/_layout.tsx

import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import tw from 'twrnc';
import CustomAlert from '@/ui/CustomAlert';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <SafeAreaProvider>
        <Slot />
        <CustomAlert />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}