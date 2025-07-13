// app/(tabs)/timer.tsx

import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import type { Session } from '@supabase/supabase-js';
import tw from 'twrnc';

// 作成したコンポーネントをインポート
import ModeSelector, { TimerMode } from '@/components/timers/ModeSelector';
import StopwatchTimer from '@/components/timers/StopwatchTimer';
import CountdownTimer from '@/components/timers/CountdownTimer';
import PomodoroTimer from '@/components/timers/PomodoroTimer';

// ログイン後に表示されるタイマー画面全体のコンテナ
const TimerContainer = () => {
  const [mode, setMode] = useState<TimerMode>('Stopwatch');

  const renderTimer = () => {
    switch (mode) {
      case 'Stopwatch':
        return <StopwatchTimer />;
      case 'Countdown':
        return <CountdownTimer />;
      case 'Pomodoro':
        return <PomodoroTimer />;
      default:
        return null;
    }
  };

  return (
    <View style={tw`flex-1 bg-black`}>
      <ModeSelector selectedMode={mode} onSelect={setMode} />
      {renderTimer()}
    </View>
  );
};

// timer.tsx のメインコンポーネント（認証部分）
export default function TimerScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => authListener?.subscription.unsubscribe();
  }, []);

  if (loading) return <View style={tw`flex-1 bg-black`} />;

  return (
    <View style={tw`flex-1`}>
      {session && session.user ? <TimerContainer /> : <Auth />}
    </View>
  );
}