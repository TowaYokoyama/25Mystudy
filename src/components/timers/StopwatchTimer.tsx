// src/components/timers/StopwatchTimer.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { formatTime } from '@/utils/helpers';

// 親から受け取るPropsの型を定義
interface Props {
  time: number;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  setTime: (time: number) => void;
  onSessionComplete: (duration: number) => void;
}

export default function StopwatchTimer({ time, isActive, setIsActive, setTime, onSessionComplete }: Props) {
  const handleStartStop = () => {
    if (isActive && time > 0) {
      onSessionComplete(time);
      setTime(0);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
  };

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Text style={[tw`text-white`, { fontSize: 80, fontFamily: 'RobotoSlab-Regular' }]}>{formatTime(time)}</Text>
      <View style={tw`flex-row mt-12`}>
        <TouchableOpacity onPress={handleReset} style={tw`w-24 h-24 bg-gray-800 rounded-full justify-center items-center mx-4`}>
          <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>リセット</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleStartStop} style={tw`w-24 h-24 bg-orange-600 rounded-full justify-center items-center mx-4`}>
          <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>{isActive ? '終了で保存' : 'スタート'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}