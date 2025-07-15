// src/components/Flashcard.tsx

import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Image } from 'react-native';
import tw from 'twrnc';

interface Props {
  frontText: string | null;
  backText: string;
  frontImageUrl: string | null;
}

export default function Flashcard({ frontText, backText ,frontImageUrl }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // カードを反転させるメインのアニメーション
  const flipCard = () => {
    setIsFlipped(!isFlipped);
    // より物理的な動きをするspringアニメーションに変更
    Animated.spring(animatedValue, {
      toValue: isFlipped ? 0 : 180,
      friction: 8, // バネの摩擦（数値が低いほど弾む）
      tension: 10, // バネの張力
      useNativeDriver: true,
    }).start();
  };

  // 押した時に小さくなるアニメーション
  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  // 離した時に元に戻るアニメーション
  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };
  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };
  const cardAnimatedStyle = {
    transform: [{ scale: scaleValue }],
  };

    return (
    <View>
      <Pressable onPress={flipCard} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[tw`w-full aspect-video`, { transform: [{ perspective: 1000 }, ...cardAnimatedStyle.transform] }]}>
          {/* カードの表面 */}
          <Animated.View
            style={[
              tw`absolute w-full h-full bg-gray-800 rounded-xl justify-center items-center p-4 shadow-lg`,
              { backfaceVisibility: 'hidden' },
              frontAnimatedStyle,
            ]}
          >
            {/* ===== ここから変更：画像がある場合は画像を表示 ===== */}
            {frontImageUrl ? (
              <Image source={{ uri: frontImageUrl }} style={tw`w-full h-full rounded-xl`} resizeMode="contain" />
            ) : (
              <Text style={[tw`text-white text-xl text-center`, { fontFamily: 'RobotoSlab-Regular' }]}>
                {frontText}
              </Text>
            )}
            {/* ===== ここまで変更 ===== */}
          </Animated.View>

          {/* カードの裏面 (変更なし) */}
          <Animated.View
            style={[
              tw`absolute w-full h-full bg-orange-600 rounded-xl justify-center items-center p-4 shadow-lg`,
              { backfaceVisibility: 'hidden' },
              backAnimatedStyle,
            ]}
          >
            <Text style={[tw`text-white text-xl text-center`, { fontFamily: 'RobotoSlab-Bold' }]}>
              {backText}
            </Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}