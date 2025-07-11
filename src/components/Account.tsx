// src/components/Account.tsx

import React from 'react'
import { View, Text, Button } from 'react-native'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import tw from 'twrnc'

export default function Account({ session }: { session: Session }) {
  return (
    <View style={tw`p-5`}>
      <Text style={tw`text-white mb-5`}>
        Logged in as: {session.user.email}
      </Text>
      <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
    </View>
  )
}