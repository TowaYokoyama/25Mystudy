// App.tsx

import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native'
import { supabase } from '../src/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import Auth from '../src/components/Auth'
import Account from '../src/components/Account'
import tw from 'twrnc'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // 現在のセッション情報を取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 認証状態の変化を監視（ログイン、ログアウト時に発動）
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    // コンポーネントが破棄される時にリスナーを解除
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900 justify-center`}>
      {/* sessionが存在すればAccount画面、なければAuth画面を表示 */}
      {session && session.user ? (
        <Account key={session.user.id} session={session} />
      ) : (
        <Auth />
      )}
    </SafeAreaView>
  )
}