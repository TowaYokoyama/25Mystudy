import React from 'react';
import { View, TouchableOpacity, Animated, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// TabButtonコンポーネント（変更なし）
const TabButton = ({ route, isFocused, navigation }: { route: any, isFocused: boolean, navigation: any }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const animatedScale = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
  });

  // ===== 新しいタブ構成に合わせてアイコンとタイトルを更新 =====
  const tabInfo: { [key: string]: { icon: string, title: string } } = {
    timer: { icon: 'stopwatch', title: 'タイマー' },
    cards: { icon: 'clone', title: 'カード' },
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
  const textColor = isFocused ? tw.color('orange-500') : tw.color('gray-500');

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

// タブバー全体のコンポーネント（変更なし）
export default function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[
      tw`flex-row bg-black border-t border-t-gray-900`,
      { 
        height: 60 + bottom,
        paddingBottom: bottom
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
