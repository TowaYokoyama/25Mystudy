import React, { useState } from 'react';
import { Alert, View, TextInput, TouchableOpacity, Text, Image, ActivityIndicator } from 'react-native'; 
import { supabase } from '@/lib/supabase';
import tw from 'twrnc';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ... (signIn, signUpのロジックは変更なし)
  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert("エラー", "メールアドレスとパスワードを入力してください。");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("ログインエラー", error.message);
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    if (!email || !password) {
        Alert.alert("エラー", "メールアドレスとパスワードを入力してください。");
        return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("アカウント作成エラー", error.message);
    } else {
      Alert.alert("確認メールを送信しました", "受信トレイを確認して、メールアドレスの認証を完了してください。");
    }
    setLoading(false);
  }

  return (
    // ===== 背景色を黒に =====
    <View style={tw`flex-1 bg-black items-center justify-center p-8`}> 
      <Image 
        source={require('../../assets/freepik_assistant_1752229097825.png')} 
        style={tw`w-32 h-32 mb-4`}
        resizeMode="contain"
      />

      <Text style={[
        tw`text-white text-3xl mb-8`, 
        { fontFamily: 'RobotoSlab-Bold' }
      ]}>
        Study App
      </Text>

      {/* ===== 入力欄の背景を濃い灰色に ===== */}
      <TextInput
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="メールアドレス"
        autoCapitalize={'none'}
        keyboardType="email-address"
        style={[
          tw`w-full p-4 mb-4 bg-gray-900 rounded-lg text-white`,
          { fontFamily: 'RobotoSlab-Regular' }
        ]}
        placeholderTextColor={tw.color('gray-500')}
      />
      <TextInput
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry={true}
        placeholder="パスワード"
        autoCapitalize={'none'}
        style={[
          tw`w-full p-4 mb-6 bg-gray-900 rounded-lg text-white`,
          { fontFamily: 'RobotoSlab-Regular' }
        ]}
        placeholderTextColor={tw.color('gray-500')}
      />

      {loading ? (
        <ActivityIndicator size="large" color={tw.color('orange-500')} />
      ) : (
        <>
          {/* ===== ボタンの色をオレンジに ===== */}
          <TouchableOpacity
            onPress={signInWithEmail}
            style={tw`w-full bg-orange-600 rounded-lg py-4 items-center mb-4`}
          >
            <Text style={[
              tw`text-white font-bold text-base`,
              { fontFamily: 'RobotoSlab-Bold' }
            ]}>
              サインイン
            </Text>
          </TouchableOpacity>

          {/* ===== サブボタンの色を濃い灰色に ===== */}
          <TouchableOpacity
            onPress={signUpWithEmail}
            style={tw`w-full bg-gray-800 rounded-lg py-4 items-center`}
          >
            <Text style={[
              tw`text-white font-bold text-base`,
              { fontFamily: 'RobotoSlab-Bold' }
            ]}>
              アカウント作成
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}