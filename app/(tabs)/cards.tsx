// app/(tabs)/cards.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, TextInput, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// DraggableFlatListをインポート
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

interface Deck {
  id: string;
  name: string;
  description: string | null;
  deck_type: 'text' | 'image';
  position: number;
}

export default function CardsScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckType, setNewDeckType] = useState<'text' | 'image'>('text');
  const isFocused = useIsFocused();

  const fetchDecks = async () => {
    // positionの順に並び替えて取得
    const { data, error } = await supabase.from('flashcard_decks').select('*').order('position');
    if (error) Alert.alert('エラー', 'デッキの取得に失敗しました。');
    else setDecks(data as Deck[] || []);
  };

  useEffect(() => {
    if (isFocused) fetchDecks();
  }, [isFocused]);

  const handleAddDeck = async () => {
    if (!newDeckName.trim()) {
      Alert.alert('エラー', 'デッキ名を入力してください。');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // 新しいデッキは一番最後のpositionに設定
    const newPosition = decks.length;

    const { error } = await supabase
      .from('flashcard_decks')
      .insert({ name: newDeckName, description: newDeckDesc, user_id: user.id, deck_type: newDeckType, position: newPosition });

    if (error) Alert.alert('デッキ作成エラー', error.message);
    else {
      setNewDeckName('');
      setNewDeckDesc('');
      setNewDeckType('text');
      setModalVisible(false);
      fetchDecks();
    }
  };

  // ドラッグして並び替えた後の処理
  const handleDragEnd = async ({ data: newOrder }: { data: Deck[] }) => {
    // 見た目をすぐに更新
    setDecks(newOrder);

    // データベースに新しい順番を保存
    const updates = newOrder.map((deck, index) => ({
      id: deck.id,
      position: index,
    }));

    const { error } = await supabase.from('flashcard_decks').upsert(updates);
    if (error) {
      Alert.alert('エラー', '順番の保存に失敗しました。');
      fetchDecks(); // 失敗したら元の順番に戻す
    }
  };

  // 各デッキ項目を描画するコンポーネント
  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Deck>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag} // 長押しでドラッグ開始
          disabled={isActive}
          style={[
            tw`bg-gray-900 p-4 rounded-lg mb-3 flex-row items-center`,
            isActive ? tw`shadow-2xl` : tw`shadow-md`,
          ]}
        >
          <FontAwesome5 name={item.deck_type === 'image' ? 'image' : 'font'} size={20} color={tw.color('gray-400')} />
          <View style={tw`ml-4 flex-1`}>
            <Link href={{ pathname: "/decks/[id]", params: { id: item.id, name: item.name, deck_type: item.deck_type } }}>
              <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>{item.name}</Text>
            </Link>
            {item.description && (
              <Text style={[tw`text-gray-400 mt-1`, { fontFamily: 'RobotoSlab-Regular' }]}>{item.description}</Text>
            )}
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, []);

  return (
    <View style={tw`flex-1 bg-black p-4`}>
      <Modal visible={isModalVisible} /* ... */ >
        {/* ... (モーダルの内容は変更なし) ... */}
      </Modal>
      
      <DraggableFlatList
        data={decks}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={tw`flex-1 justify-center items-center mt-20`}>
            <Text style={tw`text-gray-500`}>まだデッキがありません。</Text>
          </View>
        )}
      />
      
      <TouchableOpacity style={tw`absolute bottom-8 right-8 ...`} onPress={() => setModalVisible(true)}>
        <FontAwesome5 name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}