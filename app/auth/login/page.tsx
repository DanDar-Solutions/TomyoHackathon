"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signinRegistry } from '@/core/auth-action'

export default function LoginPage() {
    const router = useRouter()
    const [userId, setUserId]     = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading]   = useState(false)
    const [error, setError]       = useState<string | null>(null)

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const result = await signinRegistry(userId.trim(), password.trim())

        if (result.error) {
            setError(result.error)
            setLoading(false)
            return
        }

        // Cookie is already set by the server action.
        // Redirect: if no quiz yet → /quiz, else → /dashboard
        router.push(result.hasQuiz ? '/dashboard' : '/quiz')
        router.refresh()   // force navbar/layout to re-read the cookie
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f3ee] p-4 font-serif">
            <div className="bg-white rounded-[16px] border border-[#e8e3da] p-10 px-8 w-full max-w-[400px] flex flex-col">
                <h1 className="text-[24px] font-semibold text-[#1a1714] m-0 mb-1 text-center tracking-tight">
                    Student Portal
                </h1>
                <p className="text-[14px] text-[#7a7268] text-center m-0 mb-8">
                    Sign in with your registry ID
                </p>

                <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#3d3830]">Registry ID</label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="e.g. STU-2024-001"
                            required
                            autoComplete="username"
                            className="p-2.5 px-3.5 rounded-lg border border-[#ddd8cf] text-[15px] text-[#1a1714] bg-[#fafaf8] outline-none transition-colors focus:border-gray-400 font-sans"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#3d3830]">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                            className="p-2.5 px-3.5 rounded-lg border border-[#ddd8cf] text-[15px] text-[#1a1714] bg-[#fafaf8] outline-none transition-colors focus:border-gray-400 font-sans"
                        />
                    </div>

                    {error && (
                        <p className="text-[13px] text-[#c0392b] bg-[#fdf0ee] border border-[#f5c6c0] rounded-lg p-2.5 px-3 m-0">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#2c2620] text-white border-none rounded-lg p-2.5 text-[15px] font-medium cursor-pointer mt-1 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center relative hover:opacity-90 min-h-[44px]"
                    >
                        {loading
                            ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-[spin_1s_linear_infinite] absolute" />
                            : 'Sign in →'
                        }
                    </button>
                </form>
            </div>
        </div>
    )
}