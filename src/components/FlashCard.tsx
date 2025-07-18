// src/components/Flashcard.tsx

import { FontAwesome5 } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Image, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

interface Props {
  front_text: string | null;
  back_text: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
  onDelete: () => void;
  showDeleteButton: boolean;
}
export default function Flashcard({ front_text, back_text, front_image_url, back_image_url, onDelete, showDeleteButton  }: Props) {
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
      toValue: 0.98,
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
    transform: [
        { perspective: 1000},
        { scale: scaleValue }],
  };

    return(
      <View>
      <Pressable onPress={flipCard} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[tw`w-full aspect-video`, cardAnimatedStyle]}>
          <Animated.View style={[tw`absolute w-full h-full bg-gray-800 rounded-xl justify-center items-center p-4 shadow-lg`, { backfaceVisibility: 'hidden' }, frontAnimatedStyle]}>
            {front_image_url ? (
              <Image source={{ uri: front_image_url }} style={tw`w-full h-full rounded-xl`} resizeMode="contain" />
            ) : (
              <Text style={[tw`text-white text-xl text-center`, { fontFamily: 'RobotoSlab-Regular' }]}>{front_text}</Text>
            )}
          </Animated.View>
          <Animated.View style={[tw`absolute w-full h-full bg-orange-600 rounded-xl justify-center items-center p-4 shadow-lg`, { backfaceVisibility: 'hidden' }, backAnimatedStyle]}>
            {back_image_url ? (
              <Image source={{ uri: back_image_url}} style={tw`w-full h-full rounded-xl`} resizeMode="contain" />
            ) : (
              <Text style={[tw`text-white text-xl text-center`, { fontFamily: 'RobotoSlab-Bold' }]}>{back_text}</Text>
            )}
          </Animated.View>
        </Animated.View>
      </Pressable>
      {showDeleteButton && (
        <TouchableOpacity onPress={onDelete} style={tw`absolute top-2 right-2 bg-gray-900 bg-opacity-50 p-2 rounded-full z-10`}>
          <FontAwesome5 name="trash-alt" size={18} color={tw.color('white')} />
        </TouchableOpacity>
      )}
    </View>
  );
}
