import './auth.css'
import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'


export default function Auth({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) {

    const [mode, setMode] = useState('signin') // 'signin' | 'signup'
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [signUpSuccess, setSignUpSuccess] = useState(false)
    const supabase = createClient()
    const resetForm = () => {
        setUserId('')
        setPassword('')
        setConfirmPassword('')
        setError(null)
    }

    const switchMode = (newMode: string) => {
        resetForm()
        setMode(newMode)
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
            .from('demo_users')
            .select('*')
            .eq('user_id', userId)
            .eq('password', password)
            .maybeSingle()

        if (fetchError) {
            setError('Something went wrong. Please try again.')
        } else if (!data) {
            setError('Invalid user ID or password.')
        } else {
            onAuthSuccess(data)
        }

        setLoading(false)
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            setLoading(false)
            return
        }

        // Check if user_id already exists
        const { data: existing } = await supabase
            .from('demo_users')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle()

        if (existing) {
            setError('This user ID is already taken. Please choose another.')
            setLoading(false)
            return
        }

        const { data: newUser, error: insertError } = await supabase
            .from('demo_users')
            .insert([{ user_id: userId, password }])
            .select()
            .single()

        if (insertError) {
            setError('Failed to create account. Please try again.')
        } else {
            setSignUpSuccess(true)
        }


        setLoading(false)
    }

    if (signUpSuccess) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-success-icon">✓</div>
                    <h2 className="auth-title">Account created!</h2>
                    <p className="auth-subtitle-center">
                        Your account <strong>{userId}</strong> has been created successfully.
                    </p>
                    <button
                        onClick={() => onAuthSuccess({ user_id: userId, password })}
                        className="auth-primary-btn"
                    >
                        Continue →
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-app-title">Student Portal</h1>
                <p className="auth-app-sub">
                    {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
                </p>

                {/* Tab switcher */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${mode === 'signin' ? 'auth-tab-active' : ''}`}
                        onClick={() => switchMode('signin')}
                    >
                        Sign in
                    </button>
                    <button
                        className={`auth-tab ${mode === 'signup' ? 'auth-tab-active' : ''}`}
                        onClick={() => switchMode('signup')}
                    >
                        Sign up
                    </button>
                </div>

                <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label">User ID</label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="Enter your user ID"
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="auth-input"
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="auth-field">
                            <label className="auth-label">Confirm password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password"
                                required
                                className="auth-input"
                            />
                        </div>
                    )}

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" disabled={loading} className="auth-primary-btn">
                        {loading ? <div className="loader" /> : mode === 'signin' ? 'Sign in' : 'Create account'}
                    </button>
                </form>

                <p className="auth-switch-text">
                    {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="auth-link-btn"
                    >
                        {mode === 'signin' ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    )

}
