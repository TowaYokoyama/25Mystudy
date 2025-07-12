import React from 'react';
import { View, TouchableOpacity, Animated, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
// 【改善点1】react-native-safe-area-contextからuseSafeAreaInsetsをインポート
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// TabButtonコンポーネントは変更なし（省略）
const TabButton = ({ route, isFocused, navigation }: { route: any, isFocused: boolean, navigation: any }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const animatedScale = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
  });
  const tabInfo: { [key: string]: { icon: string, title: string } } = {
    index: { icon: 'home', title: 'ホーム' },
    sessions: { icon: 'clock', title: 'セッション' },
    profile: { icon: 'user-alt', title: 'プロフィール' },
  };
  const { icon, title } = tabInfo[route.name] || { icon: 'question-circle', title: route.name };

  const animate = (toValue: number) => {
    return new Promise<void>((resolve) => {
      Animated.timing(animatedValue, {
        toValue,
        duration: 150,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) resolve();
      });
    });
  };

  const onPress = () => {
    animate(100).then(() => animate(0));
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome5);
  const AnimatedText = Animated.createAnimatedComponent(Text);
  const textColor = isFocused ? tw.color('cyan-400') : tw.color('gray-500');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1.0}
      style={tw`flex-1 items-center justify-center`}
    >
      <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
        <AnimatedIcon
          name={icon}
          color={textColor}
          style={{ fontSize: 24, textAlign: 'center', marginBottom: 4 }}
        />
        <AnimatedText style={{ color: textColor, fontSize: 11, fontFamily: 'RobotoSlab-Bold' }}>
          {title}
        </AnimatedText>
      </Animated.View>
    </TouchableOpacity>
  );
};


// タブバー全体のコンポーネント
export default function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  // 【改善点2】フックを呼び出して、画面下部のセーフエリアの高さを取得
  const { bottom } = useSafeAreaInsets();

  return (
    // 【改善点3】取得したセーフエリアの高さを、高さと下のパディングに適用
    <View style={[
      tw`flex-row bg-gray-900 border-t border-t-gray-800`,
      { 
        height: 60 + bottom, // タブバーの基本の高さ(60) + 下のセーフエリアの高さ
        paddingBottom: bottom // 下のパディングにセーフエリアの高さを設定
      }
    ]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        return (
          <TabButton
            key={route.key}
            route={route}
            isFocused={isFocused}
            navigation={navigation}
          />
        );
      })}
    </View>
  );
}
