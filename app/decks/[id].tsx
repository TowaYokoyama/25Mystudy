// app/decks/[id].tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, FlatList, Dimensions, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';
import { useIsFocused } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

import Flashcard from '@/components/FlashCard'; // 作成したカードコンポーネントをインポート

interface Card {
  id: string;
  front_text: string;
  back_text: string;
}

export default function DeckDetailScreen() {
  const { id: deckId, name } = useLocalSearchParams<{ id: string; name:string }>();
  const [cards, setCards] = useState<Card[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const isFocused = useIsFocused();

  const fetchCards = async () => {
    if (!deckId) return;
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId);
    
    if (error) Alert.alert('エラー', 'カードの取得に失敗しました。');
    else setCards(data || []);
  };

  useEffect(() => {
    if (isFocused) fetchCards();
  }, [isFocused]);

  const handleAddCard = async () => {
    if (!frontText.trim() || !backText.trim()) {
      Alert.alert('エラー', '表と裏の両方を入力してください。');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !deckId) return;

    const { error } = await supabase
      .from('flashcards')
      .insert({ front_text: frontText, back_text: backText, deck_id: deckId, user_id: user.id });

    if (error) Alert.alert('カード追加エラー', error.message);
    else {
      setFrontText('');
      setBackText('');
      setModalVisible(false);
      fetchCards();
    }
  };

  return (
    <View style={tw`flex-1 bg-black`}>
      <Stack.Screen options={{ title: name || 'デッキ' }} />

      {/* カード追加モーダル */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-70`}>
          <View style={tw`bg-gray-900 p-6 rounded-2xl w-11/12`}>
            <Text style={[tw`text-white text-xl mb-4`, { fontFamily: 'RobotoSlab-Bold' }]}>新しいカードを追加</Text>
            <TextInput style={[tw`w-full p-3 bg-gray-800 rounded-lg text-white mb-4`, { fontFamily: 'RobotoSlab-Regular' }]} placeholder="問題（おもて）" placeholderTextColor={tw.color('gray-500')} value={frontText} onChangeText={setFrontText} />
            <TextInput style={[tw`w-full p-3 bg-gray-800 rounded-lg text-white mb-4`, { fontFamily: 'RobotoSlab-Regular' }]} placeholder="答え（うら）" placeholderTextColor={tw.color('gray-500')} value={backText} onChangeText={setBackText} />
            <TouchableOpacity style={tw`bg-orange-600 rounded-lg py-3 items-center`} onPress={handleAddCard}>
              <Text style={[tw`text-white font-bold`, { fontFamily: 'RobotoSlab-Bold' }]}>追加</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`mt-4 items-center`} onPress={() => setModalVisible(false)}>
              <Text style={tw`text-gray-400`}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* カード学習エリア */}
      <View style={tw`flex-1 justify-center items-center`}>
        <FlatList
          data={cards}
          renderItem={({ item }) => (
            <View style={{ width: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center' }}>
              <Flashcard frontText={item.front_text} backText={item.back_text} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          horizontal // 横スクロールにする
          pagingEnabled // ページ単位でスナップする
          showsHorizontalScrollIndicator={false} // スクロールバーを非表示
          ListEmptyComponent={() => (
            <View style={tw`flex-1 justify-center items-center`}>
              <Text style={tw`text-gray-500`}>まだカードがありません。</Text>
              <Text style={tw`text-gray-500`}>右下のボタンから追加しましょう！</Text>
            </View>
          )}
        />
      </View>
      
      {/* カード追加ボタン */}
      <TouchableOpacity
        style={tw`absolute bottom-8 right-8 w-16 h-16 bg-orange-600 rounded-full justify-center items-center shadow-lg`}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome5 name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}