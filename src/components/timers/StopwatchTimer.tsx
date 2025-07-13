// src/components/timers/StopwatchTimer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { formatTime } from '@/utils/helpers'; // 後で作成する共通関数

export default function StopwatchTimer() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleStartStop = () => setIsActive(!isActive);
  const handleReset = () => {
    setIsActive(false);
    setTime(0);
  };

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Text style={[tw`text-white`, { fontSize: 80, fontFamily: 'RobotoSlab-Regular' }]}>
        {formatTime(time)}
      </Text>
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