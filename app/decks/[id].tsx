// app/decks/[id].tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, Modal, TextInput, SafeAreaView, Image, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';
import { useIsFocused } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js'; // toByteArrayの代わりに、より標準的なdecodeを使います
import * as ImageManipulator from 'expo-image-manipulator'; // 画像圧縮ライブラリをインポート

import Flashcard from '@/components/FlashCard';

// Cardの型定義
interface Card {
  id: string;
  front_text: string | null;
  back_text: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
}

// メインの画面コンポーネント
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
  const [isUploading, setIsUploading] = useState(false);

  const fetchCards = async () => {
    if (!deckId) return;
    const { data, error } = await supabase.from('flashcards').select('*').eq('deck_id', deckId).order('created_at');
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
      // ===== ここからが修正点：画像圧縮処理 =====
      const manipResult = await ImageManipulator.manipulateAsync(
        image.uri,
        [{ resize: { width: 800 } }], // 横幅を800ピクセルにリサイズ
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // 圧縮率70%のJPEG形式に
      );
      const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${deckId}/${fileName}`;
      const base64 = await FileSystem.readAsStringAsync(image.uri, { encoding: FileSystem.EncodingType.Base64 });
      const { error } = await supabase.storage.from('flashcards').upload(filePath, toByteArray(base64), { contentType: `image/${fileExt}` });


      if (error){
         console.error("【デバッグログ】アップロードエラー:", error);
       throw error};


      const { data: urlData } = supabase.storage.from('flashcards').getPublicUrl(filePath);

      // ===== ここが監視カメラ！ =====
      console.log("【デバッグログ】取得した公開URL:", urlData.publicUrl);
      // ==========================
      return urlData.publicUrl;
    } catch (error: any) {
      Alert.alert('アップロードエラー', error.message);
      return null;
    }
  };

  const handleAddCard = async () => {
    const isImageDeck = deck_type === 'image';
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

    setIsUploading(true);
    try{
    let frontImageUrl: string | null = null;
    let backImageUrl: string | null = null;
    const finalFrontText = isImageDeck ? null : frontText;
    if (isImageDeck && frontImage) {
        frontImageUrl = await uploadImage(frontImage, user.id);
    }
    if (backImage) {
        backImageUrl = await uploadImage(backImage, user.id);
    }

    const { error: insertError } = await supabase.from('flashcards').insert({
        front_text: finalFrontText,
        back_text: backText,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        deck_id: deckId,
        user_id: user.id,
      });

    if (insertError) {
        Alert.alert('カード追加エラー', insertError.message);
    }  
      setFrontText('');
      setBackText('');
      setFrontImage(null);
      setBackImage(null);
      setModalVisible(false);
      fetchCards();
    } catch(error:any) {
      Alert.alert('カード追加エラー', error.massage);
    }finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCard = (cardToDelete: Card) => {
    Alert.alert("カードの削除", "このカードを本当に削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        onPress: async () => {
          const { error } = await supabase.from('flashcards').delete().eq('id', cardToDelete.id);
          if (error) {
            Alert.alert('削除エラー', error.message);
          } else {
            setCards(currentCards => currentCards.filter(card => card.id !== cardToDelete.id));
            Alert.alert('削除しました');
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleShuffle = () => {
    // Fisher-Yates shuffle algorithm 
   const shuffled = [...cards]; //配列をコピー
   for (let i = shuffled.length -1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; //要素を入れ替え
   } 
   setCards(shuffled); //シャッフルされた配列をセット
   Alert.alert('シャフルを完了', 'カードの順番を入れ替えました');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-black`}>
      <Stack.Screen options={{ headerShown: false }} />
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-70`}>
          <ScrollView contentContainerStyle={tw`flex-grow justify-center items-center w-full`}>
            <View style={tw`bg-gray-900 p-6 rounded-2xl w-11/12`}>
              <Text style={[tw`text-white text-xl mb-4`, { fontFamily: 'RobotoSlab-Bold' }]}>新しいカードを追加</Text>
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

                {isUploading ? (
                <View style={tw`py-3 items-center`}>
                  <ActivityIndicator size="large" color={tw.color('orange-500')} />
                  <Text style={tw`text-gray-400 mt-2`}>アップロード中...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity style={tw`bg-orange-600 rounded-lg py-3 items-center`} onPress={handleAddCard}>
                    <Text style={[tw`text-white font-bold`, { fontFamily: 'RobotoSlab-Bold' }]}>追加</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={tw`mt-4 items-center`} onPress={() => setModalVisible(false)}>
                    <Text style={tw`text-gray-400`}>キャンセル</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      
      <View style={tw`flex-row items-center justify-between p-4`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
            <FontAwesome5 name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={[tw`text-white text-xl ml-4`, { fontFamily: 'RobotoSlab-Bold' }]}>{name}</Text>
        </View>
        {/*todo：　ここに苦手なカードを復習ボタンの設置*/}

        <TouchableOpacity onPress={handleShuffle} style={tw`p-2`}>
          <FontAwesome5 name="random" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cards}
        renderItem={({ item }) => (
          <View style={tw`px-4 mb-4`}>
            <Flashcard
              front_text={item.front_text}
              back_text={item.back_text}
              front_image_url={item.front_image_url}
              back_image_url={item.back_image_url}
              onDelete={() => handleDeleteCard(item)}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`p-4 pb-24`}
        ListEmptyComponent={() => (
          <View style={tw`flex-1 justify-center items-center h-96`}>
            <Text style={tw`text-gray-500`}>まだカードがありません。</Text>
            <Text style={tw`text-gray-500`}>右下のボタンから追加しましょう！</Text>
          </View>
        )}
      />
      
      <TouchableOpacity
        style={tw`absolute bottom-8 right-8 w-16 h-16 bg-orange-600 rounded-full justify-center items-center shadow-lg`}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome5 name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}