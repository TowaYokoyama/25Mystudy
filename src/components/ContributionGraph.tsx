// src/components/ContributionGraph.tsx

import React from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { ContributionGraph } from 'react-native-chart-kit';
import tw from 'twrnc';

export interface ContributionData {
  date: string;
  count: number; // ここには0〜4の「レベル」が入ってきます
}

interface Props {
  data: ContributionData[];
  isLoading: boolean;
}

export default function StudyContributionGraph({ data, isLoading }: Props) {
  const chartConfig = {
    backgroundGradientFrom: tw.color('gray-900'),
    backgroundGradientTo: tw.color('gray-900'),
    // ライブラリがcount(0〜4)を元に自動計算した透明度(opacity)を使って色を決定します
    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  return (
    <View style={tw`items-center p-4 bg-gray-900 rounded-lg`}>
      <Text style={[tw`text-white text-lg mb-4`, { fontFamily: 'RobotoSlab-Bold' }]}>
        学習記録
      </Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={tw.color('orange-500')} style={tw`h-56`} />
      ) : (
        <ContributionGraph
          values={data}
          endDate={new Date()}
          numDays={105}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={chartConfig}
          tooltipDataAttrs={() => ({})}
        />
      )}
    </View>
  );
}