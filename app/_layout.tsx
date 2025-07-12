// app/_layout.tsx

import { Tabs } from 'expo-router';
import AnimatedTabBar from '@/components/AnimatedTabBar'; // 作成したカスタムタブバーをインポート

export default function TabLayout() {
  return (
    <Tabs
      // tabBarプロパティに自作コンポーネントを渡す
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tabs.Screen
        name="index" // app/index.tsx
        options={{ headerShown: false }} // ヘッダーは不要なので非表示
      />
      <Tabs.Screen
        name="sessions" // app/sessions.tsx
        options={{ headerShown: false }}
      />
      <Tabs.Screen
        name="profile" // app/profile.tsx
        options={{ headerShown: false }}
      />
    </Tabs>
  );
}