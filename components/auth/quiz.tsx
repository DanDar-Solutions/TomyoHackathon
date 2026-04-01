"use client";
import './quiz.css'
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

        // Map question IDs → category
        const categoryMap: Record<string, string> = {}
        questions.forEach((q) => {
            categoryMap[q.id] = q.category
        })

        // Build profile payload with explicit column mapping
        const profilePayload: Record<string, any> = {
            user_id: user.user_id,
        }
        
        // Build demo_users payload for schedule stuff
        const demoUsersPayload: Record<string, any> = {}

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

        questions.forEach((q) => {
            const value = answers[q.id]
            if (value === undefined) return

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
                    // Distinguish by question_order
                    if (q.question_order === 4) demoUsersPayload.home_arrival_time = value
                    if (q.question_order === 5) demoUsersPayload.study_start_time = value
                    if (q.question_order === 6) demoUsersPayload.sleep_time = value
                    break
            }
        })

        // 1. Update demo_users with schedule data if any exists
        if (Object.keys(demoUsersPayload).length > 0) {
            const { error: syncError } = await supabase
                .from('demo_users')
                .update(demoUsersPayload)
                .eq('user_id', user.user_id)
                
            if (syncError) {
                setError('Failed to sync schedule metadata. Please try again.')
                setSaving(false)
                return
            }
        }

        // 2. Upsert user_profiles with psychology data
        const { error: upsertError } = await supabase
            .from('user_profiles')
            .upsert(profilePayload, { onConflict: 'user_id' })

        if (upsertError) {
            setError('Failed to save your profile insights. Please try again.')
            setSaving(false)
        } else {
            onComplete(user)
        }
    }

    if (loading) {
        return (
            <div className="q-page">
                <div className="q-loader-wrap">
                    <div className="q-spinner" />
                    <p>Loading your setup…</p>
                </div>
            </div>
        )
    }

    if (!questions.length) {
        return (
            <div className="q-page">
                <div className="q-card">
                    <p>No questions found. Please contact support.</p>
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
        <div className="q-page">
            {/* Background blobs */}
            <div className="q-blob q-blob-1" />
            <div className="q-blob q-blob-2" />

            <div className="q-shell">
                {/* Header */}
                <div className="q-header">
                    <span className="q-brand">Student Portal</span>
                    <span className="q-step-badge">{current + 1} / {questions.length}</span>
                </div>

                {/* Progress bar */}
                <div className="q-progress-track">
                    <div className="q-progress-fill" style={{ width: `${progress}%` }} />
                </div>

                {/* Card */}
                <div className={`q-card ${animating ? (direction === 'forward' ? 'q-slide-out-left' : 'q-slide-out-right') : 'q-slide-in'}`}>
                    <div className="q-category-tag">{q.category.replace(/_/g, ' ')}</div>
                    <h2 className="q-question">{q.question_text}</h2>

                    {/* Options grid or text input */}
                    {opts.length > 0 ? (
                        <div className={`q-options ${opts.length > 4 ? 'q-options-grid' : 'q-options-col'}`}>
                            {opts.map((opt) => (
                                <button
                                    key={opt.value}
                                    className={`q-option ${currentAnswer === opt.value ? 'q-option-selected' : ''}`}
                                    onClick={() => handleSelect(opt.value)}
                                >
                                    {currentAnswer === opt.value && <span className="q-check">✓</span>}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    ) : isTimeCategory(q.category) ? (
                        <div className="q-input-wrap">
                            <input
                                type="time"
                                className="q-input"
                                value={currentAnswer}
                                onChange={(e) => handleSelect(e.target.value)}
                            />
                        </div>
                    ) : isNumberCategory(q.category) ? (
                        <div className="q-input-wrap">
                            <input
                                type="number"
                                className="q-input"
                                placeholder="Enter a number"
                                value={currentAnswer}
                                onChange={(e) => handleSelect(e.target.value)}
                                min={1}
                                max={12}
                            />
                        </div>
                    ) : (
                        <div className="q-input-wrap">
                            <input
                                type="text"
                                className="q-input"
                                placeholder="Type your answer…"
                                value={currentAnswer}
                                onChange={(e) => handleSelect(e.target.value)}
                            />
                        </div>
                    )}

                    {error && <p className="q-error">{error}</p>}
                </div>

                {/* Navigation */}
                <div className="q-nav">
                    <button
                        className="q-btn-back"
                        onClick={handleBack}
                        disabled={current === 0}
                    >
                        ← Back
                    </button>

                    <button
                        className="q-btn-next"
                        onClick={handleNext}
                        disabled={!canProceed || saving}
                    >
                        {saving ? (
                            <span className="q-btn-spinner" />
                        ) : isLast ? (
                            'Finish setup →'
                        ) : (
                            'Next →'
                        )}
                    </button>
                </div>

                {/* Dot indicators */}
                <div className="q-dots">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`q-dot ${i === current ? 'q-dot-active' : ''} ${answers[questions[i].id] ? 'q-dot-done' : ''}`}
                        />
                    ))}
                </div>
            </div>
            </div>)}