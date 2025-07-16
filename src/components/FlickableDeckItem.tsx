// src/components/FlickableDeckItem.tsx

import React from 'react';
import { View, Text, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Link } from 'expo-router';

interface Deck {
  id: string;
  name: string;
  description: string | null;
  deck_type: 'text' | 'image';
}

interface Props {
  deck: Deck;
  onDelete: () => void; // 引数をなくし、よりシンプルに
}

const ITEM_HEIGHT = 80;
const DELETE_THRESHOLD = -ITEM_HEIGHT * 1.5;

export default function FlickableDeckItem({ deck, onDelete }: Props) {
  const translateY = useSharedValue(0);
  const itemHeight = useSharedValue(ITEM_HEIGHT);
  const marginValue = useSharedValue(12); // marginBottom

  const deleteDeck = () => {
    Alert.alert(
      "デッキの削除",
      `「${deck.name}」を本当に削除しますか？`,
      [
        { text: "キャンセル", onPress: () => (translateY.value = withTiming(0)), style: "cancel" },
        {
          text: "削除",
          onPress: async () => {
            const { error } = await supabase.from('flashcard_decks').delete().eq('id', deck.id);
            if (error) {
              Alert.alert('削除エラー', error.message);
              translateY.value = withTiming(0);
            } else {
              // アニメーションで高さを0にしてから、親コンポーネントに削除を通知
              itemHeight.value = withTiming(0, { duration: 200 });
              marginValue.value = withTiming(0, { duration: 200 }, () => {
                runOnJS(onDelete)();
              });
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const panGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onUpdate((event) => {
      if (event.translationY < 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (translateY.value < DELETE_THRESHOLD) {
        runOnJS(deleteDeck)();
      } else {
        translateY.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: itemHeight.value,
    marginBottom: marginValue.value,
    opacity: withTiming(itemHeight.value === 0 ? 0 : 1, { duration: 200 }),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <Link href={{ pathname: "/decks/[id]", params: { id: deck.id, name: deck.name, deck_type: deck.deck_type } }} asChild>
          <View style={tw`bg-gray-900 p-4 rounded-lg flex-row items-center h-full`}>
            <FontAwesome5 name={deck.deck_type === 'image' ? 'image' : 'font'} size={20} color={tw.color('gray-400')} />
            <View style={tw`ml-4 flex-1`}>
              <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]} numberOfLines={1}>{deck.name}</Text>
              {deck.description && (
                <Text style={[tw`text-gray-400 mt-1`, { fontFamily: 'RobotoSlab-Regular' }]} numberOfLines={1}>{deck.description}</Text>
              )}
            </View>
          </View>
        </Link>
      </Animated.View>
    </GestureDetector>
  );
}