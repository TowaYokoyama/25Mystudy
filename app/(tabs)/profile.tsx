// app/(tabs)/profile.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import tw from 'twrnc';

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <View style={tw`flex-1 items-center bg-black p-8`}>
      {/* TODO: ここにGitHub風の草グラフを実装 */}
      <View style={tw`flex-1 justify-center`}>
        <Text style={tw`text-gray-400`}>ここにコントリビューショングラフが表示されます</Text>
      </View>

      {/* ユーザー情報とサインアウトボタン */}
      <View style={tw`w-full`}>
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
  );
}
