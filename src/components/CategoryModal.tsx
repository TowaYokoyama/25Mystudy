// src/components/CategoryModal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons'; // アイコンのためにインポート

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

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      Alert.alert('カテゴリー読み取りエラー', error.message);
    } else {
      setCategories(data || []);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchCategories();
    }
  }, [isVisible]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('categories')
      .insert({ name: newCategoryName, user_id: user.id });

    if (error) {
      Alert.alert('カテゴリー追加エラー', error.message);
    } else {
      setNewCategoryName('');
      fetchCategories();
    }
  };
  
  // ===== ここから追加：カテゴリー削除機能 =====
  const handleDeleteCategory = async (categoryId: string) => {
    Alert.alert(
      "削除の確認",
      "このカテゴリーを本当に削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { 
          text: "削除", 
          onPress: async () => {
            const { error } = await supabase
              .from('categories')
              .delete()
              .eq('id', categoryId);

            if (error) {
              Alert.alert('カテゴリー削除エラー', error.message);
            } else {
              fetchCategories(); // 削除後にリストを再読み込み
            }
          },
          style: "destructive"
        },
      ]
    );
  };
  // ===== ここまで追加 =====

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
              // ===== ここから変更：削除アイコンを追加 =====
              <View style={tw`flex-row items-center justify-between p-3 border-b border-gray-700`}>
                <TouchableOpacity 
                  style={tw`flex-1`}
                  onPress={() => onSelectCategory(item.name)}
                >
                  <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Regular' }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
                  <FontAwesome5 name="trash-alt" size={20} color={tw.color('gray-500')} />
                </TouchableOpacity>
              </View>
              // ===== ここまで変更 =====
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