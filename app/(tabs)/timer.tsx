// app/(tabs)/timer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import CategoryModal from '@/components/CategoryModal'; // 作成したモーダルをインポート
import type { Session } from '@supabase/supabase-js';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons';

// 時間を mm:ss 形式にフォーマットするヘルパー関数
const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// ログイン後に表示されるタイマー本体のコンポーネント
const TimerComponent = ({ session }: { session: Session }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('未選択');
  const [isModalVisible, setModalVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // タイマーを停止してセッションを保存する
  const handleStopAndSave = async () => {
    setIsActive(false);
    if (time === 0) return; // 時間が0なら保存しない

    const { error } = await supabase.from('sessions').insert({
      duration: time,
      category: selectedCategory === '未選択' ? null : selectedCategory,
      user_id: session.user.id,
    });

    if (error) {
      Alert.alert('エラー', 'セッションの保存に失敗しました。');
    } else {
      Alert.alert('保存しました', `${formatTime(time)} の学習を記録しました。`);
    }
    setTime(0); // 時間をリセット
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-black`}>
      <CategoryModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setModalVisible(false);
        }}
      />
      
      <Text style={[tw`text-white`, { fontSize: 80, fontFamily: 'RobotoSlab-Regular' }]}>
        {formatTime(time)}
      </Text>

      {/* カテゴリー選択ボタン */}
      <TouchableOpacity 
        style={tw`flex-row items-center mt-4 mb-12 p-2 bg-gray-800 rounded-lg`}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome5 name="tag" size={16} color={tw.color('gray-400')} />
        <Text style={[tw`text-gray-300 ml-2`, { fontFamily: 'RobotoSlab-Regular' }]}>
          {selectedCategory}
        </Text>
      </TouchableOpacity>

      {/* ボタンエリア */}
      <View style={tw`flex-row items-center`}>
        {isActive ? (
          // タイマー作動中のボタン
          <TouchableOpacity
            onPress={handleStopAndSave}
            style={tw`w-32 h-32 bg-orange-600 rounded-full justify-center items-center`}
          >
            <Text style={[tw`text-white text-2xl`, { fontFamily: 'RobotoSlab-Bold' }]}>終了</Text>
          </TouchableOpacity>
        ) : (
          // タイマー停止中のボタン
          <TouchableOpacity
            onPress={() => setIsActive(true)}
            style={tw`w-32 h-32 bg-green-600 rounded-full justify-center items-center`}
          >
            <Text style={[tw`text-white text-2xl`, { fontFamily: 'RobotoSlab-Bold' }]}>開始</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// timer.tsx のメインコンポーネント
export default function TimerScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => authListener?.subscription.unsubscribe();
  }, []);

  if (loading) return <View style={tw`flex-1 bg-black`} />;

  return (
    <View style={tw`flex-1`}>
      {session && session.user ? <TimerComponent session={session} /> : <Auth />}
    </View>
  );
}