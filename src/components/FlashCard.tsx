// src/components/Flashcard.tsx

import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import tw from 'twrnc';

interface Props {
  frontText: string;
  backText: string;
}

export default function Flashcard({ frontText, backText }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // 表面の回転アニメーション
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  // 裏面の回転アニメーション
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.timing(animatedValue, {
      toValue: isFlipped ? 0 : 180,
      duration: 600, // アニメーションの時間
      useNativeDriver: true,
    }).start();
  };

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };
  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity onPress={flipCard} activeOpacity={1}>
      <View style={tw`w-80 h-48`}>
        {/* カードの表面 */}
        <Animated.View
          style={[
            tw`absolute w-full h-full bg-gray-800 rounded-xl justify-center items-center p-4`,
            { backfaceVisibility: 'hidden' }, // 裏面を非表示にする
            frontAnimatedStyle,
          ]}
        >
          <Text style={[tw`text-white text-xl`, { fontFamily: 'RobotoSlab-Regular' }]}>
            {frontText}
          </Text>
        </Animated.View>

        {/* カードの裏面 */}
        <Animated.View
          style={[
            tw`absolute w-full h-full bg-orange-600 rounded-xl justify-center items-center p-4`,
            { backfaceVisibility: 'hidden' },
            backAnimatedStyle,
          ]}
        >
          <Text style={[tw`text-white text-xl`, { fontFamily: 'RobotoSlab-Bold' }]}>
            {backText}
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}