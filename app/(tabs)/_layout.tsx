// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import AnimatedTabBar from '@/components/AnimatedTabBar';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={tw`flex-1`}>
      <StatusBar style="light" />
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: tw.color('black'),
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTintColor: tw.color('gray-200'),
          headerTitleStyle: {
            fontFamily: 'RobotoSlab-Bold',
          },
        }}
      >
        <Tabs.Screen
          name="timer"
          options={{
            title: 'タイマー',
          }}
        />
        <Tabs.Screen
          name="cards"
          options={{
            title: 'フラッシュカード',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'プロフィール',
          }}
        />
      </Tabs>
    </View>
  );
}
