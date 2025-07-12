import { Tabs } from 'expo-router';
import AnimatedTabBar from '@/components/AnimatedTabBar';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';

export default function TabLayout() {
  return (
    <>
      {/* ステータスバーの文字色を白に設定 */}
      <StatusBar style="light" />
      <Tabs
        // tabBarプロパティは変更なし
        tabBar={(props) => <AnimatedTabBar {...props} />}
        
        // ===== 全画面共通のスクリーン設定を更新 =====
        screenOptions={{
          // --- ヘッダーのスタイル ---
          headerShown: true, // ヘッダーを表示
          headerStyle: {
            backgroundColor: tw.color('black'), // 背景をリッチな黒に
            shadowOpacity: 0, // iOSでの影を消す
            elevation: 0, // Androidでの影を消す
          },
          headerTintColor: tw.color('gray-200'), // 文字色を少し柔らかい白に
          headerTitleStyle: {
            fontFamily: 'RobotoSlab-Bold', // フォントは共通
          },
        }}
        // ==================================
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'ホーム', // ヘッダーに表示されるタイトル
          }}
        />
        <Tabs.Screen
          name="sessions"
          options={{
            title: '学習セッション', // ヘッダーに表示されるタイトル
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'プロフィール', // ヘッダーに表示されるタイトル
          }}
        />
      </Tabs>
    </>
  );
}
