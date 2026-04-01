"use client";
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'

interface Question {
    id: string
    question_order: number
    question_text: string
    category: string
    options: string[] | { label: string; value: string }[]
}

interface QuestionsProps {
    user: any
    onComplete: (updatedUser: any) => void
}

export default function Questions({ user, onComplete }: QuestionsProps) {
    const [questions, setQuestions] = useState<Question[]>([])
    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [animating, setAnimating] = useState(false)
    const [direction, setDirection] = useState<'forward' | 'back'>('forward')
    const supabase = createClient()
    useEffect(() => {
        fetchQuestions()
    }, [])

    const fetchQuestions = async () => {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('question_order', { ascending: true })

        if (error) {
            setError('Failed to load questions.')
        } else {
            setQuestions(data || [])
        }
        setLoading(false)
    }

    const normalizeOptions = (options: any): { label: string; value: string }[] => {
        if (!Array.isArray(options)) return []
        return options.map((opt) =>
            typeof opt === 'string' ? { label: opt, value: opt } : opt
        )
    }

    const isTimeCategory = (category: string) =>
        category.toLowerCase().includes('time')

    const isNumberCategory = (category: string) => category === 'grade'

    const goTo = (next: number, dir: 'forward' | 'back') => {
        setDirection(dir)
        setAnimating(true)
        setTimeout(() => {
            setCurrent(next)
            setAnimating(false)
        }, 280)
    }

    const handleSelect = (value: string) => {
        const q = questions[current]
        setAnswers((prev) => ({ ...prev, [q.id]: value }))
    }

    const handleNext = () => {
        if (current < questions.length - 1) {
            goTo(current + 1, 'forward')
        } else {
            handleSubmit()
        }
    }

    const handleBack = () => {
        if (current > 0) goTo(current - 1, 'back')
    }

    const handleSubmit = async () => {
        setSaving(true)
        setError(null)

        // Energy level → stress_level (invert: high energy = low stress)
        const stressMap: Record<string, string> = {
            very_low: 'high',
            low: 'medium',
            medium: 'low',
            high: 'very_low',
        }

        // Difficulty → procrastination_risk
        const riskMap: Record<string, string> = {
            very_easy: 'low',
            easy: 'low',
            medium: 'medium',
            hard: 'high',
        }

        // All fields go into user_profiles (schedules times live there, not on demo_users)
        const profilePayload: Record<string, any> = {
            user_id: user.user_id,
        }

        questions.forEach((q) => {
            const value = answers[q.id]
            if (value === undefined || value === '') return

            switch (q.category) {
                case 'learning_style':
                    profilePayload.learning_style = value
                    break
                case 'energy_level':
                    profilePayload.stress_level = stressMap[value] ?? value
                    break
                case 'homework_difficulty':
                    profilePayload.procrastination_risk = riskMap[value] ?? value
                    break
                case 'schedule':
                    // Map by question_order to the correct user_profiles columns
                    if (q.question_order === 4) profilePayload.home_arrival_time = value
                    if (q.question_order === 5) profilePayload.study_start_time   = value
                    if (q.question_order === 6) profilePayload.sleep_time         = value
                    break
            }
        })

        // Upsert into user_profiles — all psychology + schedule data goes here
        const { error: upsertError } = await supabase
            .from('user_profiles')
            .upsert(profilePayload, { onConflict: 'user_id' })

        if (upsertError) {
            setError('Failed to save your profile. Please try again.')
            setSaving(false)
        } else {
            onComplete(user)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] font-['Sora',sans-serif] p-6 relative">
                <div className="flex flex-col items-center gap-4 text-[#7a6e5f] text-[0.9rem] z-10">
                    <div className="w-9 h-9 border-4 border-black/10 border-t-[#7ea86a] rounded-full animate-[spin_0.8s_linear_infinite]" />
                    <p>Loading your setup…</p>
                </div>
            </div>
        )
    }

    if (!questions.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] font-['Sora',sans-serif] p-6 relative">
                <div className="bg-[#fffdf7] rounded-[24px] border border-black/5 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)] p-10 pb-9 flex flex-col items-center z-10 w-full max-w-[540px]">
                    <p className="text-[#2c2416] font-medium">No questions found. Please contact support.</p>
                </div>
            </div>
        )
    }

    const q = questions[current]
    const opts = normalizeOptions(q.options)
    const currentAnswer = answers[q.id] ?? ''
    const progress = ((current + 1) / questions.length) * 100
    const isLast = current === questions.length - 1
    const canProceed = currentAnswer !== '' && currentAnswer !== undefined

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] font-['Sora',sans-serif] p-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute rounded-full blur-[80px] opacity-35 pointer-events-none w-[480px] h-[480px] bg-[radial-gradient(circle,#c9d8b6_0%,#a8c090_100%)] top-[-120px] right-[-100px]" />
            <div className="absolute rounded-full blur-[80px] opacity-35 pointer-events-none w-[360px] h-[360px] bg-[radial-gradient(circle,#e8d5b0_0%,#d4b896_100%)] bottom-[-80px] left-[-80px]" />

            <div className="w-full max-w-[540px] relative z-10 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-[18px]">
                    <span className="font-['Lora',serif] italic text-[1.1rem] text-[#4a4235] tracking-tight">Student Portal</span>
                    <span className="text-[0.75rem] font-semibold tracking-widest uppercase text-[#7a6e5f] bg-white/60 border border-black/5 px-2.5 py-1 rounded-[20px]">{current + 1} / {questions.length}</span>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-black/[0.08] rounded overflow-hidden mb-7">
                    <div className="h-full bg-gradient-to-r from-[#7ea86a] to-[#5c8c48] rounded transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                </div>

                {/* Card */}
                <div className={`bg-[#fffdf7] rounded-[24px] border border-black/5 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)] p-10 pb-9 min-h-[340px] flex flex-col transition-all duration-[280ms] ease-out 
                    ${animating ? (direction === 'forward' ? 'opacity-0 -translate-x-5' : 'opacity-0 translate-x-5') : 'opacity-100 translate-x-0'}
                    sm:max-w-none sm:p-10 p-7 sm:pb-9 pb-6`}>
                    
                    <div className="text-[0.68rem] font-semibold tracking-widest uppercase text-[#9b8c79] mb-3.5">{q.category.replace(/_/g, ' ')}</div>
                    <h2 className="font-['Lora',serif] sm:text-[1.55rem] text-[1.25rem] font-semibold text-[#2c2416] leading-snug m-0 mb-7 tracking-tight">{q.question_text}</h2>

                    {/* Options grid or text input */}
                    {opts.length > 0 ? (
                        <div className={`flex flex-col gap-2.5 flex-1 ${opts.length > 4 ? 'grid sm:grid-cols-2 grid-cols-1' : ''}`}>
                            {opts.map((opt) => (
                                <button
                                    key={opt.value}
                                    className={`relative border-[1.5px] rounded-xl p-[13px] px-[18px] text-[0.9rem] font-medium cursor-pointer text-left transition-all duration-200 font-['Sora',sans-serif] flex items-center gap-2.5 outline-none
                                        ${currentAnswer === opt.value
                                            ? 'bg-[#2c2416] text-[#f5f0e8] border-[#2c2416] hover:bg-[#3a3028] hover:border-[#3a3028]'
                                            : 'bg-[#f5f0e8] text-[#3a3028] border-transparent hover:bg-[#ede7d8] hover:border-black/10 hover:-translate-y-[1px]'}`}
                                    onClick={() => handleSelect(opt.value)}
                                >
                                    {currentAnswer === opt.value && <span className="text-[0.8rem] text-[#c9d8b6] shrink-0">✓</span>}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    ) : isTimeCategory(q.category) ? (
                        <div className="flex-1 flex items-start pt-2">
                            <input
                                type="time"
                                className="w-full bg-[#f0ebe0] border-[1.5px] border-black/[0.08] rounded-xl p-[14px] px-[18px] text-[1rem] font-medium text-[#2c2416] font-['Sora',sans-serif] outline-none transition-all duration-200 focus:border-[#7ea86a] focus:ring-[3px] focus:ring-[#7ea86a]/15"
                                value={currentAnswer}
                                onChange={(e) => handleSelect(e.target.value)}
                            />
                        </div>
                    ) : isNumberCategory(q.category) ? (
                        <div className="flex-1 flex items-start pt-2">
                            <input
                                type="number"
                                className="w-full bg-[#f0ebe0] border-[1.5px] border-black/[0.08] rounded-xl p-[14px] px-[18px] text-[1rem] font-medium text-[#2c2416] font-['Sora',sans-serif] outline-none transition-all duration-200 focus:border-[#7ea86a] focus:ring-[3px] focus:ring-[#7ea86a]/15 placeholder:text-[#b0a596]"
                                placeholder="Enter a number"
                                value={currentAnswer}
                                onChange={(e) => handleSelect(e.target.value)}
                                min={1}
                                max={12}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex items-start pt-2">
                            <input
                                type="text"
                                className="w-full bg-[#f0ebe0] border-[1.5px] border-black/[0.08] rounded-xl p-[14px] px-[18px] text-[1rem] font-medium text-[#2c2416] font-['Sora',sans-serif] outline-none transition-all duration-200 focus:border-[#7ea86a] focus:ring-[3px] focus:ring-[#7ea86a]/15 placeholder:text-[#b0a596]"
                                placeholder="Type your answer…"
                                value={currentAnswer}
                                onChange={(e) => handleSelect(e.target.value)}
                            />
                        </div>
                    )}

                    {error && <p className="mt-3 text-[0.82rem] text-[#c0392b] font-medium">{error}</p>}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-5">
                    <button
                        className="bg-transparent border-none font-['Sora',sans-serif] text-[0.88rem] font-medium text-[#7a6e5f] cursor-pointer py-2.5 transition-colors hover:text-[#2c2416] disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={handleBack}
                        disabled={current === 0}
                    >
                        ← Back
                    </button>

                    <button
                        className="bg-[#2c2416] text-[#f5f0e8] border-none rounded-xl p-[13px] px-7 font-['Sora',sans-serif] text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 min-w-[140px] flex items-center justify-center gap-2 hover:bg-[#3a3028] hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(44,36,22,0.2)] disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        onClick={handleNext}
                        disabled={!canProceed || saving}
                    >
                        {saving ? (
                            <span className="w-4 h-4 border-2 border-[#f5f0e8]/30 border-t-[#f5f0e8] rounded-full animate-[spin_0.7s_linear_infinite]" />
                        ) : isLast ? (
                            'Finish setup →'
                        ) : (
                            'Next →'
                        )}
                    </button>
                </div>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-1.5 mt-5">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`h-[6px] rounded-full transition-all duration-250 ease-out
                                ${i === current ? 'w-5 bg-[#2c2416]' : 'w-[6px]'}
                                ${answers[questions[i].id] && i !== current ? 'bg-[#7ea86a]' : ''}
                                ${!answers[questions[i].id] && i !== current ? 'bg-black/15' : ''}
                            `}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}