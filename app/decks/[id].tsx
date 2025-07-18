// app/decks/[id].tsx

import React, { useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';
import { useIsFocused } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import Flashcard from '@/components/FlashCard';
import { useFlashcardStore } from '@/stores/flashcardStore';

export default function DeckDetailScreen() {
  const { id: deckId, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const isFocused = useIsFocused();

  const { topCard, middleCard, bottomCard, setDeck, goToNext, deleteCurrentCard } = useFlashcardStore();

  useEffect(() => {
    const fetchAndSetDeck = async () => {
      if (!deckId) return;
      const { data, error } = await supabase.from('flashcards').select('*').eq('deck_id', deckId).order('created_at');
      if (error) Alert.alert('エラー', 'カードの取得に失敗しました。');
      else setDeck(data || []);
    };
    if (isFocused) {
      fetchAndSetDeck();
    }
  }, [isFocused, deckId]);

  const handleDelete = () => {
    Alert.alert("カードの削除", "このカードを本当に削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", onPress: async () => {
          const success = await deleteCurrentCard();
          if (success) Alert.alert('削除しました');
      }, style: "destructive" },
    ]);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-black`}>
      <Stack.Screen options={{ headerShown: false}} />

      <View style={tw`flex-row items-center p-4`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
          <FontAwesome5 name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[tw`text-white text-xl ml-4`, { fontFamily: 'RobotoSlab-Bold' }]}>{name}</Text>
      </View>

      <View style={tw`flex-1 justify-center items-center`}>
        {/* 上のカード */}
        <View style={tw`absolute top-8 w-full`}>
          {topCard && (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={tw`px-8`}>
              <Flashcard
                front_text={topCard.front_text}
                back_text={topCard.back_text}
                front_image_url={topCard.front_image_url}
                back_image_url={topCard.back_image_url}
                onDelete={() => {}}
                showDeleteButton={false}
              />
            </Animated.View>
          )}
        </View>

        {/* 中央のカード（メイン） */}
        <View style={tw`w-full`}>
          {middleCard ? (
            <Animated.View entering={FadeIn} style={tw`px-4`}>
              {/* ===== ここからが修正点：プロパティを一つずつ渡す ===== */}
              <Flashcard
                front_text={middleCard.front_text}
                back_text={middleCard.back_text}
                front_image_url={middleCard.front_image_url}
                back_image_url={middleCard.back_image_url}
                onDelete={handleDelete}
                showDeleteButton={true}
              />
              {/* ===== ここまでが修正点 ===== */}
            </Animated.View>
          ) : (
            <Text style={tw`text-gray-500 text-center`}>カードがありません。</Text>
          )}
        </View>

        {/* 下のカード */}
        <View style={tw`absolute bottom-8 w-full`}>
          {bottomCard && (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={tw`px-8`}>
              <Flashcard
                front_text={bottomCard.front_text}
                back_text={bottomCard.back_text}
                front_image_url={bottomCard.front_image_url}
                back_image_url={bottomCard.back_image_url}
                onDelete={() => {}}
                showDeleteButton={false}
              />
            </Animated.View>
          )}
        </View>
      </View>

      <View style={tw`flex-row justify-center items-center p-4`}>
        <TouchableOpacity onPress={goToNext} style={tw`bg-orange-600 rounded-full py-4 px-8`}>
          <Text style={[tw`text-white font-bold text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>次のカードへ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}