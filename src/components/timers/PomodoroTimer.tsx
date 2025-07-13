// src/components/timers/PomodoroTimer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { formatTime } from '@/utils/helpers';

// ポモドーロのモードを定義
type PomodoroMode = 'Work' | 'Break';

// 各モードの時間（秒単位）
const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

export default function PomodoroTimer() {
  const [mode, setMode] = useState<PomodoroMode>('Work'); // 現在のモード
  const [time, setTime] = useState(WORK_DURATION); // 残り時間
  const [isActive, setIsActive] = useState(false); // タイマーがアクティブか
   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // タイマーの核となるロジック
  useEffect(() => {
    if (isActive && time > 0) {
      // タイマー作動中
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      // 時間がゼロになったらモードを切り替える
      Alert.alert(
        mode === 'Work' ? "お疲れ様でした！" : "休憩終了！",
        mode === 'Work' ? "5分間の休憩を開始します。" : "集中を再開しましょう。"
      );
      const nextMode: PomodoroMode = mode === 'Work' ? 'Break' : 'Work';
      setMode(nextMode);
      setTime(nextMode === 'Work' ? WORK_DURATION : BREAK_DURATION);
      setIsActive(true); // 自動で次のタイマーを開始
    }

    // クリーンアップ
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, time, mode]);

  const handleStartStop = () => {
    setIsActive(!isActive);
  };

  // リセットボタンの処理
  const handleReset = () => {
    setIsActive(false);
    setMode('Work');
    setTime(WORK_DURATION);
  };

  // 現在のモードに応じてUIの色やテキストを変更
  const isWorkMode = mode === 'Work';
  const themeColor = isWorkMode ? tw`bg-orange-600` : tw`bg-cyan-600`;
  const modeText = isWorkMode ? '集中モード' : '休憩モード';

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      {/* 現在のモード表示 */}
      <View style={[tw`px-4 py-2 rounded-full mb-8`, themeColor]}>
        <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>
          {modeText}
        </Text>
      </View>

      {/* 時間表示 */}
      <Text style={[tw`text-white`, { fontSize: 80, fontFamily: 'RobotoSlab-Regular' }]}>
        {formatTime(time)}
      </Text>

      {/* ボタンエリア */}
      <View style={tw`flex-row mt-12`}>
        <TouchableOpacity 
          onPress={handleReset} 
          style={tw`w-24 h-24 bg-gray-800 rounded-full justify-center items-center mx-4`}
        >
          <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>リセット</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleStartStop} 
          style={[tw`w-24 h-24 rounded-full justify-center items-center mx-4`, themeColor]}
        >
          <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>
            {isActive ? 'ストップ' : 'スタート'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
