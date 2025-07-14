// app/(tabs)/cards.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router'; // 画面遷移のためにLinkをインポート

interface Deck {
  id: string;
  name: string;
  description: string | null;
}

export default function CardsScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const isFocused = useIsFocused();

  const fetchDecks = async () => {
    const { data, error } = await supabase.from('flashcard_decks').select('*');
    if (error) {
      Alert.alert('エラー', 'デッキの取得に失敗しました。');
    } else {
      setDecks(data || []);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchDecks();
    }
  }, [isFocused]);

  const handleAddDeck = async () => {
    if (!newDeckName.trim()) {
      Alert.alert('エラー', 'デッキ名を入力してください。');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('flashcard_decks')
      .insert({ name: newDeckName, description: newDeckDesc, user_id: user.id });

    if (error) {
      Alert.alert('デッキ作成エラー', error.message);
    } else {
      setNewDeckName('');
      setNewDeckDesc('');
      setModalVisible(false);
      fetchDecks();
    }
  };

  return (
    <View style={tw`flex-1 bg-black p-4`}>
      {/* デッキ作成モーダル (変更なし) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-70`}>
          <View style={tw`bg-gray-900 p-6 rounded-2xl w-11/12`}>
            <Text style={[tw`text-white text-xl mb-4`, { fontFamily: 'RobotoSlab-Bold' }]}>
              新しいデッキを作成
            </Text>
            <TextInput
              style={[tw`w-full p-3 bg-gray-800 rounded-lg text-white mb-4`, { fontFamily: 'RobotoSlab-Regular' }]}
              placeholder="デッキ名"
              placeholderTextColor={tw.color('gray-500')}
              value={newDeckName}
              onChangeText={setNewDeckName}
            />
            <TextInput
              style={[tw`w-full p-3 bg-gray-800 rounded-lg text-white mb-4 h-24`, { fontFamily: 'RobotoSlab-Regular', textAlignVertical: 'top' }]}
              placeholder="説明（任意）"
              placeholderTextColor={tw.color('gray-500')}
              value={newDeckDesc}
              onChangeText={setNewDeckDesc}
              multiline
            />
            <TouchableOpacity
              style={tw`bg-orange-600 rounded-lg py-3 items-center`}
              onPress={handleAddDeck}
            >
              <Text style={[tw`text-white font-bold`, { fontFamily: 'RobotoSlab-Bold' }]}>作成</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`mt-4 items-center`} onPress={() => setModalVisible(false)}>
              <Text style={tw`text-gray-400`}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* デッキ一覧 */}
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // ===== ここから変更：Linkコンポーネントでラップ =====
          <Link href={{ pathname: "/decks/[id]", params: { id: item.id, name: item.name } }} asChild>
            <TouchableOpacity style={tw`bg-gray-900 p-4 rounded-lg mb-3`}>
              <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>{item.name}</Text>
              {item.description && (
                <Text style={[tw`text-gray-400 mt-1`, { fontFamily: 'RobotoSlab-Regular' }]}>{item.description}</Text>
              )}
            </TouchableOpacity>
          </Link>
          // ===== ここまで変更 =====
        )}
        ListEmptyComponent={() => (
          <View style={tw`flex-1 justify-center items-center mt-20`}>
            <Text style={tw`text-gray-500`}>まだデッキがありません。</Text>
            <Text style={tw`text-gray-500`}>右下のボタンから作成しましょう！</Text>
          </View>
        )}
      />

      {/* 新規作成ボタン (変更なし) */}
      <TouchableOpacity
        style={tw`absolute bottom-8 right-8 w-16 h-16 bg-orange-600 rounded-full justify-center items-center shadow-lg`}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome5 name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}