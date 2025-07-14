// app/(tabs)/profile.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import tw from 'twrnc';
import { useIsFocused } from '@react-navigation/native';

import StudyContributionGraph, { ContributionData } from '@/components/ContributionGraph';

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [contributionData, setContributionData] = useState<ContributionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const fetchContributionData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('created_at, duration')
      .eq('user_id', user.id);

    if (error) {
      Alert.alert('エラー', '学習記録の取得に失敗しました。');
      setIsLoading(false);
      return;
    }

    const dailyTotals: { [key: string]: number } = {};
    data.forEach(session => {
      const date = formatDate(new Date(session.created_at));
      dailyTotals[date] = (dailyTotals[date] || 0) + session.duration;
    });

    // ===== ここからが新しいロジック =====
    // 学習時間（秒）を、より滑らかな0〜5のレベルに変換する関数
    const mapDurationToLevel = (durationInSeconds: number): number => {
      if (durationInSeconds <= 0) return 0;
      
      const durationInMinutes = durationInSeconds / 60;
      const maxMinutes = 9 * 60; // 上限9時間 = 540分

      // 学習時間を1〜5の範囲にマッピングする（対数的な変化）
      // これにより、短い時間でも色がつき、長い時間ほど色の変化が緩やかになる
      const level = Math.log(durationInMinutes + 1) / Math.log(maxMinutes + 1) * 5;
      
      // 0にはならず、最大で5になるように調整
      return Math.max(1, Math.min(Math.ceil(level), 5));
    };

    const formattedData: ContributionData[] = Object.keys(dailyTotals).map(date => ({
      date: date,
      count: mapDurationToLevel(dailyTotals[date]),
    }));
    // ===== ここまでが新しいロジック =====

    setContributionData(formattedData);
    setIsLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    
    if (isFocused) {
      fetchContributionData();
    }
  }, [isFocused]);

  return (
    <ScrollView style={tw`flex-1 bg-black`}>
      <View style={tw`p-4`}>
        <StudyContributionGraph data={contributionData} isLoading={isLoading} />
        <View style={tw`w-full mt-8`}>
          <Text style={[tw`text-white text-center mb-4`, { fontFamily: 'RobotoSlab-Regular' }]}>
            {session ? `ログイン中: ${session.user.email}` : 'ログインしていません'}
          </Text>
          <Button
            title="サインアウト"
            onPress={() => supabase.auth.signOut()}
            color={tw.color('orange-600')}
            disabled={!session}
          />
        </View>
      </View>
    </ScrollView>
  );
}