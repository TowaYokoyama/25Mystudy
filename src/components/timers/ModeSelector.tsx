// src/components/timers/ModeSelector.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons';

// このコンポーネントが受け取るPropsの型を定義
export type TimerMode = 'Stopwatch' | 'Pomodoro' | 'Countdown';

interface Props {
  selectedMode: TimerMode;
  onSelect: (mode: TimerMode) => void;
}

export default function ModeSelector({ selectedMode, onSelect }: Props) {
  const modes: { name: TimerMode, icon: string, label: string }[] = [
    { name: 'Stopwatch', icon: 'stopwatch', label: '限界まで' },
    { name: 'Pomodoro', icon: 'hourglass-half', label: 'ポモドーロ' },
    { name: 'Countdown', icon: 'tasks', label: '本番用' },
  ];

  return (
    <View style={tw`flex-row justify-around p-2 bg-gray-900 border-b border-gray-800`}>
      {modes.map((mode) => {
        const isSelected = selectedMode === mode.name;
        const color = isSelected ? tw.color('orange-500') : tw.color('gray-500');
        return (
          <TouchableOpacity 
            key={mode.name} 
            onPress={() => onSelect(mode.name)}
            style={tw`items-center p-2`}
          >
            <FontAwesome5 name={mode.icon} size={22} color={color} />
            <Text style={[
              tw`text-xs mt-1`,
              isSelected ? tw`text-orange-500` : tw`text-gray-500`,
              { fontFamily: 'RobotoSlab-Bold' }
            ]}>
              {mode.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  );
};
