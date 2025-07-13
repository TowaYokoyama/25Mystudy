// src/components/timers/CountdownTimer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { formatTime } from '@/utils/helpers'; // 後で作成する共通関数

export default function CountdownTimer() {
  const [initialTime, setInitialTime] = useState(45 * 60);
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => setTime((t) => t - 1), 1000);
    } else if (time === 0) {
      setIsActive(false);
      Alert.alert("時間です！", "タイマーが終了しました。");
    }
    if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, time]);

  const handleStartStop = () => setIsActive(!isActive);
  const handleReset = () => { setIsActive(false); setTime(initialTime); };
  const selectTime = (minutes: number) => {
    setIsActive(false);
    setInitialTime(minutes * 60);
  };

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <View style={tw`flex-row mb-8`}>
        {[45, 60, 80].map((min) => (
          <TouchableOpacity 
            key={min}
            onPress={() => selectTime(min)}
            style={[tw`mx-2 p-3 rounded-lg`, initialTime === min * 60 ? tw`bg-orange-600` : tw`bg-gray-800`]}
          >
            <Text style={[tw`text-white`, {fontFamily: 'RobotoSlab-Bold'}]}>{min}分</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[tw`text-white`, { fontSize: 80, fontFamily: 'RobotoSlab-Regular' }]}>{formatTime(time)}</Text>
      <View style={tw`flex-row mt-12`}>
        <TouchableOpacity onPress={handleReset} style={tw`w-24 h-24 bg-gray-800 rounded-full justify-center items-center mx-4`}>
          <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>リセット</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleStartStop} style={tw`w-24 h-24 bg-orange-600 rounded-full justify-center items-center mx-4`}>
          <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>{isActive ? 'ストップ' : 'スタート'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}