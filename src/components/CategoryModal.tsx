// src/components/CategoryModal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';

interface Category {
  id: string;
  name: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
}

export default function CategoryModal({ isVisible, onClose, onSelectCategory }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // データベースからカテゴリー一覧を取得する
  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    
    // ===== 変更点：読み取りエラーがあればアラートで表示 =====
    if (error) {
      Alert.alert('カテゴリー読み取りエラー', error.message);
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  // モーダルが開かれた時にカテゴリーを取得
  useEffect(() => {
    if (isVisible) {
      fetchCategories();
    }
  }, [isVisible]);

  // 新しいカテゴリーを追加する
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('エラー', 'ログインしていません。');
      return;
    }

    const { error } = await supabase
      .from('categories')
      .insert({ name: newCategoryName, user_id: user.id });

    if (error) {
      Alert.alert('カテゴリー追加エラー', error.message);
    } else {
      setNewCategoryName('');
      fetchCategories(); // リストを再読み込み
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
        <View style={tw`bg-gray-900 p-5 rounded-t-2xl`}>
          <Text style={[tw`text-white text-xl mb-4`, { fontFamily: 'RobotoSlab-Bold' }]}>
            カテゴリーを選択
          </Text>
          
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={tw`p-3 border-b border-gray-700`}
                onPress={() => onSelectCategory(item.name)}
              >
                <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Regular' }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            style={tw`h-48`}
          />

          <View style={tw`mt-4`}>
            <TextInput
              style={[tw`w-full p-3 bg-gray-800 rounded-lg text-white mb-2`, { fontFamily: 'RobotoSlab-Regular' }]}
              placeholder="新しいカテゴリー名"
              placeholderTextColor={tw.color('gray-500')}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TouchableOpacity
              style={tw`bg-orange-600 rounded-lg py-3 items-center`}
              onPress={handleAddCategory}
            >
              <Text style={[tw`text-white font-bold`, { fontFamily: 'RobotoSlab-Bold' }]}>追加</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={tw`mt-4 items-center`} onPress={onClose}>
            <Text style={tw`text-gray-400`}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}