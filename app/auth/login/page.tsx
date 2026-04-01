"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'  // ← add this import
import Auth from '../../../components/auth/auth'
import Questions from '../../../components/auth/quiz'

type View = 'auth' | 'questions' | 'dashboard'

export default function LoginForm() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [view, setView] = useState<View>('auth')
  const supabase = createClient();
  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user)

    // Check if this user has already completed setup
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', String(user.user_id))
      .maybeSingle()

    setView(profile ? 'dashboard' : 'questions')
  }

  const handleQuestionsComplete = (updatedUser: any) => {
    setCurrentUser(updatedUser)
    setView('dashboard')
  }

  if (view === 'auth') {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  if (view === 'questions') {
    return (
      <Questions
        user={currentUser}
        onComplete={handleQuestionsComplete}
      />
    )
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Welcome, {currentUser?.first_name}!</h1>
      <p>Dashboard coming soon.</p>
    </div>
  )
}