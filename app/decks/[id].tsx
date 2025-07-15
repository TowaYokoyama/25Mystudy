// app/decks/[id].tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, FlatList, Dimensions, TouchableOpacity, Modal, TextInput, SafeAreaView, Image } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';
import { useIsFocused } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';

import Flashcard from '@/components/FlashCard';

interface Card {
  id: string;
  front_text: string | null;
  back_text: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
}

export default function DeckDetailScreen() {
  const { id: deckId, name, deck_type } = useLocalSearchParams<{ id: string; name: string; deck_type: 'text' | 'image' }>();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [frontImage, setFrontImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [backImage, setBackImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

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

  const pickImage = async (side: 'front' | 'back') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      if (side === 'front') setFrontImage(result.assets[0]);
      else setBackImage(result.assets[0]);
    }
  };
  
  const uploadImage = async (image: ImagePicker.ImagePickerAsset, userId: string): Promise<string | null> => {
    try {
      const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${deckId}/${fileName}`;
      const base64 = await FileSystem.readAsStringAsync(image.uri, { encoding: FileSystem.EncodingType.Base64 });
      const { error } = await supabase.storage.from('flashcards').upload(filePath, toByteArray(base64), { contentType: `image/${fileExt}` });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('flashcards').getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (error: any) {
      Alert.alert('アップロードエラー', error.message);
      return null;
    }
  };

  const handleAddCard = async () => {
    const isImageDeck = deck_type === 'image';

    // バリデーション
    if (isImageDeck && !frontImage) {
      Alert.alert('エラー', '表面の画像を選択してください。');
      return;
    }
    if (!isImageDeck && !frontText.trim()) {
      Alert.alert('エラー', '問題（おもて）を入力してください。');
      return;
    }
    if (!backText.trim() && !backImage) {
      Alert.alert('エラー', '答え（うら）のテキストか画像、どちらかを入力してください。');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !deckId) return;

    // ===== ここからが修正点：データ保存ロジックの修正 =====
    let frontImageUrl: string | null = null;
    let backImageUrl: string | null = null;
    let finalFrontText: string | null = frontText;
    
    if (isImageDeck) {
      finalFrontText = null; // 画像デッキの場合、表面のテキストは保存しない
      if (frontImage) frontImageUrl = await uploadImage(frontImage, user.id);
    }
    if (backImage) backImageUrl = await uploadImage(backImage, user.id);
    
    const { error: insertError } = await supabase
      .from('flashcards')
      .insert({
        front_text: finalFrontText,
        back_text: backText,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        deck_id: deckId,
        user_id: user.id,
      });
    // ===== ここまでが修正点 =====

    if (insertError) Alert.alert('カード追加エラー', insertError.message);
    else {
      setFrontText('');
      setBackText('');
      setFrontImage(null);
      setBackImage(null);
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
            
            {/* ===== ここからが修正点：入力欄の表示切り替え ===== */}
            {deck_type === 'image' ? (
              <>
                <Text style={tw`text-gray-400 mb-2`}>問題（おもて）</Text>
                <TouchableOpacity onPress={() => pickImage('front')} style={tw`w-full h-24 bg-gray-800 rounded-lg justify-center items-center mb-4`}>
                  {frontImage ? <Image source={{ uri: frontImage.uri }} style={tw`w-full h-full rounded-lg`} /> : <Text style={tw`text-gray-400`}>画像を選択</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={tw`text-gray-400 mb-2`}>問題（おもて）</Text>
                <TextInput style={[tw`w-full p-3 bg-gray-800 rounded-lg text-white mb-4`, { fontFamily: 'RobotoSlab-Regular' }]} placeholder="問題文" placeholderTextColor={tw.color('gray-500')} value={frontText} onChangeText={setFrontText} />
              </>
            )}
            
            <Text style={tw`text-gray-400 mb-2`}>答え（うら）</Text>
            <TouchableOpacity onPress={() => pickImage('back')} style={tw`w-full h-24 bg-gray-800 rounded-lg justify-center items-center mb-2`}>
              {backImage ? <Image source={{ uri: backImage.uri }} style={tw`w-full h-full rounded-lg`} /> : <Text style={tw`text-gray-400`}>画像を選択（任意）</Text>}
            </TouchableOpacity>
            <TextInput style={[tw`w-full p-3 bg-gray-800 rounded-lg text-white mb-4`, { fontFamily: 'RobotoSlab-Regular' }]} placeholder="テキスト解説（任意）" placeholderTextColor={tw.color('gray-500')} value={backText} onChangeText={setBackText} />
            {/* ===== ここまでが修正点 ===== */}
            
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
              <Flashcard frontText={item.front_text} backText={item.back_text} frontImageUrl={item.front_image_url} backImageUrl={item.back_image_url} />
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