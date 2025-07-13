// app/(tabs)/timer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import type { Session } from '@supabase/supabase-js';
import tw from 'twrnc';

// 時間を mm:ss 形式にフォーマットするヘルパー関数
const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// ログイン後に表示されるタイマー本体のコンポーネント
const TimerComponent = () => {
  const [time, setTime] = useState(0); // 経過時間（秒）
  const [isActive, setIsActive] = useState(false); // タイマーがアクティブか
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // コンポーネントがアンマウントされる時にクリーンアップ
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const handleStartStop = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-black`}>
      {/* 時間表示 */}
      <Text style={[tw`text-white`, { fontSize: 80, fontFamily: 'RobotoSlab-Regular' }]}>
        {formatTime(time)}
      </Text>

      {/* TODO: カテゴリー選択機能はここに追加 */}
      <Text style={tw`text-gray-400 mt-4 mb-12`}>カテゴリー：未選択</Text>

      {/* ボタンエリア */}
      <View style={tw`flex-row`}>
        <TouchableOpacity
          onPress={handleReset}
          style={tw`w-24 h-24 bg-gray-800 rounded-full justify-center items-center mx-4`}
        >
          <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>リセット</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStartStop}
          style={tw`w-24 h-24 bg-orange-600 rounded-full justify-center items-center mx-4`}
        >
          <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>
            {isActive ? 'ストップ' : 'スタート'}
          </Text>
        </TouchableOpacity>
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

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <View style={tw`flex-1 bg-black`} />;
  }

  // ログインしていればタイマー画面、していなければ認証画面を表示
  return (
    <View style={tw`flex-1`}>
      {session && session.user ? <TimerComponent /> : <Auth />}
    </View>
  );
}