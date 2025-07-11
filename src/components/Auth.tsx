// src/components/Auth.tsx

import React, { useState } from 'react'
import { Alert, View, TextInput, Button, Text } from 'react-native'
import { supabase } from '../lib/supabase'
import tw from 'twrnc'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // メールでサインインする関数
  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  // メールでサインアップする関数
  async function signUpWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  return (
    <View style={tw`p-5`}>
      <View style={tw`mb-5`}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          style={tw`p-3 bg-gray-200 rounded-md text-black`}
          placeholderTextColor="gray"
        />
      </View>
      <View style={tw`mb-5`}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          style={tw`p-3 bg-gray-200 rounded-md text-black`}
          placeholderTextColor="gray"
        />
      </View>
      <View style={tw`mb-3`}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={() => signInWithEmail()}
        />
      </View>
      <View>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={() => signUpWithEmail()}
        />
      </View>
    </View>
  )
}