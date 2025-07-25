// src/components/timers/PomodoroTimer.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { formatTime } from '@/utils/helpers';

type PomodoroMode = 'Work' | 'Break';
const WORK_DURATION = 25 * 60;

interface Props {
  time: number;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  mode: PomodoroMode;
  setMode: (mode: PomodoroMode) => void;
  setTime: (time: number) => void;
}

export default function PomodoroTimer({ time, isActive, setIsActive, mode, setMode, setTime }: Props) {
  const handleStartStop = () => setIsActive(!isActive);
  const handleReset = () => {
    setIsActive(false);
    setMode('Work');
    setTime(WORK_DURATION);
  };

  const isWorkMode = mode === 'Work';
  const themeColor = isWorkMode ? tw`bg-orange-600` : tw`bg-cyan-600`;
  const modeText = isWorkMode ? '集中モード' : '休憩モード';

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <View style={[tw`px-4 py-2 rounded-full mb-8`, themeColor]}>
        <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>{modeText}</Text>
      </View>
      <Text style={[tw`text-white`, { fontSize: 80, fontFamily: 'RobotoSlab-Regular' }]}>{formatTime(time)}</Text>
      <View style={tw`flex-row mt-12`}>
        <TouchableOpacity onPress={handleReset} style={tw`w-24 h-24 bg-gray-800 rounded-full justify-center items-center mx-4`}>
          <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>リセット</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleStartStop} style={[tw`w-24 h-24 rounded-full justify-center items-center mx-4`, themeColor]}>
          <Text style={[tw`text-white text-lg`, { fontFamily: 'RobotoSlab-Bold' }]}>{isActive ? 'ストップ' : 'スタート'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
