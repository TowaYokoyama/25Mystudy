// app/_layout.tsx

import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

// アプリが起動したときに、スプラッシュスクリーン（起動画面）が自動的に消えないように設定
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // useFontsフックでフォントを読み込む
  // 'RobotoSlab-Regular' という名前で 'RobotoSlab-Regular.ttf' を利用できるようにする
  const [fontsLoaded, fontError] = useFonts({
    'RobotoSlab-Regular': require('../assets/fonts/static/RobotoSlab-Regular.ttf'),
    'RobotoSlab-Bold': require('../assets/fonts/static/RobotoSlab-Bold.ttf'),
    // 他にも使いたいフォントがあればここに追加
    // 例: 'RobotoSlab-Black': require('../assets/fonts/static/RobotoSlab-Black.ttf'),
  });

  useEffect(() => {
    // フォント読み込みでエラーが発生したら、エラーを投げる
    if (fontError) throw fontError;

    // フォントの読み込みが完了したら、スプラッシュスクリーンを非表示にする
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // フォントがまだ読み込まれていない、またはエラーが発生した場合は何も表示しない
  if (!fontsLoaded || fontError) {
    return null;
  }

  // フォント読み込み後、アプリの全画面に共通の背景色などを適用する
  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      {/* <Slot /> は、現在表示されているスクリーン(index.tsxなど)を描画する場所 */}
      <Slot />
    </SafeAreaView>
  );
}