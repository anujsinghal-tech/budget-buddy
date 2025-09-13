import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import AuthForm from './AuthForm'
import MainApp from './MainApp'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="text-center mt-5">Loading...</div>
  if (!session) return <AuthForm />
  return <MainApp user={session.user} />
}
