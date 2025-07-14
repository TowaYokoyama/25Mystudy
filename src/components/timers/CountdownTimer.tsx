// src/components/timers/CountdownTimer.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { formatTime } from '@/utils/helpers';

interface Props {
  time: number;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  initialTime: number;
  setInitialTime: (time: number) => void;
}

export default function CountdownTimer({ time, isActive, setIsActive, initialTime, setInitialTime }: Props) {
  const handleStartStop = () => setIsActive(!isActive);
  const handleReset = () => {
    setIsActive(false);
    // 親のタイマーコンテナにリセットを通知する必要があるが、
    // 今回は親のuseEffectで処理されるため、ここでは何もしない
  };
  const selectTime = (minutes: number) => {
    setIsActive(false);
    setInitialTime(minutes * 60);
  };

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <View style={tw`flex-row mb-8`}>
        {[45, 60, 80].map((min) => (
          <TouchableOpacity key={min} onPress={() => selectTime(min)} style={[tw`mx-2 p-3 rounded-lg`, initialTime === min * 60 ? tw`bg-orange-600` : tw`bg-gray-800`]}>
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
