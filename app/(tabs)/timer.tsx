// app/(tabs)/timer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import type { Session } from '@supabase/supabase-js';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons';

import ModeSelector, { TimerMode } from '@/components/timers/ModeSelector';
import CategoryModal from '@/components/CategoryModal';
import StopwatchTimer from '@/components/timers/StopwatchTimer';
import CountdownTimer from '@/components/timers/CountdownTimer';
import PomodoroTimer from '@/components/timers/PomodoroTimer';

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

// ログイン後に表示されるタイマー画面全体のコンテナ
const TimerContainer = ({ session }: { session: Session }) => {
  // ===== ここで全ての状態を一元管理！ =====
  const [mode, setMode] = useState<TimerMode>('Stopwatch');
  const [isActive, setIsActive] = useState(false);
  
  // 各タイマー用の時間状態
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(45 * 60);
  const [pomodoroTime, setPomodoroTime] = useState(WORK_DURATION);

  // その他の状態
  const [countdownInitialTime, setCountdownInitialTime] = useState(45 * 60);
  const [pomodoroMode, setPomodoroMode] = useState<'Work' | 'Break'>('Work');
  const [selectedCategory, setSelectedCategory] = useState('未選択');
  const [isModalVisible, setModalVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
 

  // タイマーのメインロジック
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      switch (mode) {
        case 'Stopwatch':
          setStopwatchTime(t => t + 1);
          break;
        case 'Countdown':
          setCountdownTime(t => {
            if (t > 1) return t - 1;
            handleSaveSession(countdownInitialTime);
            setIsActive(false);
            return countdownInitialTime;
          });
          break;
        case 'Pomodoro':
          setPomodoroTime(t => {
            if (t > 1) return t - 1;
            if (pomodoroMode === 'Work') {
              handleSaveSession(WORK_DURATION);
              setPomodoroMode('Break');
              return BREAK_DURATION;
            } else {
              setPomodoroMode('Work');
              return WORK_DURATION;
            }
          });
          break;
      }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, mode]);

  const handleModeChange = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
  };

  const handleSaveSession = async (duration: number) => {
    if (duration === 0) return;
    const { error } = await supabase.from('sessions').insert({
      duration,
      category: selectedCategory === '未選択' ? null : selectedCategory,
      user_id: session.user.id,
    });
    if (error) Alert.alert('エラー', 'セッションの保存に失敗しました。');
    else Alert.alert('お疲れ様でした！', `「${selectedCategory}」の学習を${Math.floor(duration / 60)}分記録しました。`);
  };

  const renderTimer = () => {
    switch (mode) {
      case 'Stopwatch':
        return <StopwatchTimer time={stopwatchTime} isActive={isActive} setIsActive={setIsActive} setTime={setStopwatchTime} onSessionComplete={handleSaveSession} />;
      case 'Countdown':
        return <CountdownTimer time={countdownTime} isActive={isActive} setIsActive={setIsActive} initialTime={countdownInitialTime} setInitialTime={setCountdownInitialTime} />;
      case 'Pomodoro':
        return <PomodoroTimer time={pomodoroTime} isActive={isActive} setIsActive={setIsActive} mode={pomodoroMode} setMode={setPomodoroMode} setTime={setPomodoroTime} />;
      default: return null;
    }
  };

  return (
    <View style={tw`flex-1 bg-black`}>
      <CategoryModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} onSelectCategory={(cat) => { setSelectedCategory(cat); setModalVisible(false); }} />
      <ModeSelector selectedMode={mode} onSelect={handleModeChange} />
      <View style={tw`items-center mt-8`}>
        <TouchableOpacity style={tw`flex-row items-center p-2 bg-gray-800 rounded-lg`} onPress={() => setModalVisible(true)}>
          <FontAwesome5 name="tag" size={16} color={tw.color('gray-400')} />
          <Text style={[tw`text-gray-300 ml-2`, { fontFamily: 'RobotoSlab-Regular' }]}>{selectedCategory}</Text>
        </TouchableOpacity>
      </View>
      <View style={tw`flex-1`}>{renderTimer()}</View>
    </View>
  );
};

// メインコンポーネント（認証部分）
export default function TimerScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
    return () => authListener?.subscription.unsubscribe();
  }, []);

  if (loading) return <View style={tw`flex-1 bg-black`} />;

  return (
    <View style={tw`flex-1`}>
      {session && session.user ? <TimerContainer session={session} /> : <Auth />}
    </View>
  );
}