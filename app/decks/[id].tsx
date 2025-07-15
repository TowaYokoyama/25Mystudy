// app/decks/[id].tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, FlatList, Dimensions, TouchableOpacity, Modal, TextInput, SafeAreaView, Image } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';
import { useIsFocused } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // ImagePickerをインポート
import 'react-native-get-random-values'; // アップロードに必要
import Flashcard from '@/components/FlashCard';
// Cardの型を拡張
interface Card {
  id: string;
  front_text: string | null;
  back_text: string;
  front_image_url: string | null; // 画像URLを追加
}

export default function DeckDetailScreen() {
  // deck_typeも受け取る
  const { id: deckId, name, deck_type } = useLocalSearchParams<{ id: string; name: string; deck_type: 'text' | 'image' }>();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  
  // カード追加モーダルのためのstate
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const isFocused = useIsFocused();

  const fetchCards = async () => {
    if (!deckId) return;
    const { data, error } = await supabase.from('flashcards').select('*').eq('deck_id', deckId);
    if (error) Alert.alert('エラー', 'カードの取得に失敗しました。');
    else setCards(data as Card[] || []);
  };

  useEffect(() => {
    if (isFocused) fetchCards();
  }, [isFocused]);

  // 画像を選択する関数
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };
  
  // カードを追加する関数
  const handleAddCard = async () => {
    const isImageDeck = deck_type === 'image';
    if (isImageDeck && !image) {
      Alert.alert('エラー', '画像を選択してください。');
      return;
    }
    if (!isImageDeck && !frontText.trim()) {
      Alert.alert('エラー', '問題（おもて）を入力してください。');
      return;
    }
    if (!backText.trim()) {
      Alert.alert('エラー', '答え（うら）を入力してください。');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !deckId) return;

    let imageUrl: string | null = null;
    // 画像デッキの場合、画像をアップロード
    if (isImageDeck && image) {
      const fileExt = image.uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${deckId}/${fileName}`;
      
      const formData = new FormData();
      // @ts-ignore
      formData.append('file', { uri: image.uri, name: fileName, type: image.type });
      
      const { error: uploadError } = await supabase.storage.from('flashcards').upload(filePath, formData);
      if (uploadError) {
        Alert.alert('アップロードエラー', uploadError.message);
        return;
      }

      // 公開URLを取得
      const { data: urlData } = supabase.storage.from('flashcards').getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    // カードデータをデータベースに保存
    const { error: insertError } = await supabase
      .from('flashcards')
      .insert({
        front_text: isImageDeck ? null : frontText,
        back_text: backText,
        front_image_url: imageUrl,
        deck_id: deckId,
        user_id: user.id,
      });

    if (insertError) Alert.alert('カード追加エラー', insertError.message);
    else {
      setFrontText('');
      setBackText('');
      setImage(null);
      setModalVisible(false);
      fetchCards();
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-black`}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* カード追加モーダル */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-70`}>
          <View style={tw`bg-gray-900 p-6 rounded-2xl w-11/12`}>
            <Text style={[tw`text-white text-xl mb-4`, { fontFamily: 'RobotoSlab-Bold' }]}>新しいカードを追加</Text>
            
            {/* デッキタイプに応じて入力欄を切り替え */}
            {deck_type === 'image' ? (
              <TouchableOpacity onPress={pickImage} style={tw`w-full h-32 bg-gray-800 rounded-lg justify-center items-center mb-4`}>
                {image ? (
                  <Image source={{ uri: image.uri }} style={tw`w-full h-full rounded-lg`} />
                ) : (
                  <Text style={tw`text-gray-400`}>画像を選択</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TextInput style={[tw`w-full p-3 bg-gray-800 rounded-lg text-white mb-4`, { fontFamily: 'RobotoSlab-Regular' }]} placeholder="問題（おもて）" placeholderTextColor={tw.color('gray-500')} value={frontText} onChangeText={setFrontText} />
            )}
            
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

      {/* 手動ヘッダー */}
      <View style={tw`flex-row items-center p-4`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
          <FontAwesome5 name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[tw`text-white text-xl ml-4`, { fontFamily: 'RobotoSlab-Bold' }]}>{name}</Text>
      </View>

      {/* カード学習エリア */}
      <View style={tw`flex-1 justify-center items-center`}>
        <FlatList
          data={cards}
          renderItem={({ item }) => (
            <View style={{ width: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
              {/* Flashcardコンポーネントに画像のURLも渡す */}
              <Flashcard frontText={item.front_text} backText={item.back_text} frontImageUrl={item.front_image_url} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={tw`flex-1 justify-center items-center`}>
              <Text style={tw`text-gray-500`}>まだカードがありません。</Text>
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
    </SafeAreaView>
  );
}