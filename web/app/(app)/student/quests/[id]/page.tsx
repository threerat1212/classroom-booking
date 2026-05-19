'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Clock, Lightbulb, Send, ArrowLeft, CheckCircle, XCircle, Sparkles, Trophy, Star } from 'lucide-react'
import { apiFetch } from '@/lib/http/client'
import { useQuery } from '@tanstack/react-query'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface Quest {
  id: string
  title: string
  topic: string
  difficulty: string
  question: string
  hints: string[]
  explanation?: string
  exp_reward: number
  time_limit_minutes?: number
}

interface AttemptResult {
  is_correct: boolean
  score: number
  feedback: string
  exp_earned: number
}

const diffMap: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
  medium: { label: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
  hard: { label: 'Hard', color: 'bg-orange-500/20 text-orange-400 border-orange-500/20' },
  expert: { label: 'Expert', color: 'bg-red-500/20 text-red-400 border-red-500/20' },
}

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [answer, setAnswer] = useState('')
  const [showHints, setShowHints] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AttemptResult | null>(null)
  const { refreshUser } = useCurrentUser()

  const { data: quest, isLoading } = useQuery({
    queryKey: ['quest', id],
    queryFn: async () => {
      const res = await apiFetch<{ data: Quest }>(`/api/v1/quests/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await apiFetch<{ data: AttemptResult }>('/api/v1/quests/submit', {
        method: 'POST',
        body: JSON.stringify({ quest_id: id, answer: answer.trim() }),
      })
      setResult(res.data)
      if (res.data.exp_earned > 0) {
        await refreshUser().catch(() => undefined)
      }
    } catch (err: any) {
      alert(err?.message || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  if (!quest) return null

  const diff = diffMap[quest.difficulty] || diffMap.easy

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        onClick={() => router.push('/student/quests')}
        className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Quests
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${diff.color}`}>
              {diff.label}
            </span>
            <h1 className="mt-2 text-xl font-bold text-white">{quest.title}</h1>
            <p className="mt-0.5 text-sm text-slate-400">{quest.topic}</p>
          </div>
          <div className="flex items-center gap-3">
            {quest.time_limit_minutes && (
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {quest.time_limit_minutes}m
              </div>
            )}
            <div className="flex items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
              <Zap className="h-3.5 w-3.5" />
              +{quest.exp_reward} EXP
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm font-semibold text-white">Question</h2>
        <p className="mt-3 text-base leading-relaxed text-slate-200">{quest.question}</p>

        {/* Hints */}
        {quest.hints && quest.hints.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-1.5 text-sm text-amber-400 transition-colors hover:text-amber-300"
            >
              <Lightbulb className="h-4 w-4" />
              {showHints ? 'Hide hints' : 'Need a hint?'}
            </button>
            <AnimatePresence>
              {showHints && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                    {quest.hints.map((hint, i) => (
                      <p key={i} className="text-sm text-amber-300">{i + 1}. {hint}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Answer Input */}
      {!result && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <label className="text-sm font-semibold text-white">Your Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={3}
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !answer.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 py-3 text-sm font-semibold text-white transition-all disabled:opacity-40"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Answer
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-6"
            style={{
              borderColor: result.is_correct ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)',
              background: result.is_correct
                ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))'
                : 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(236,72,153,0.05))',
            }}
          >
            <div className="flex items-center gap-3">
              {result.is_correct ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                  <Star className="h-6 w-6 text-amber-400" />
                </div>
              )}
              <div>
                <p className="text-lg font-bold text-white">
                  {result.is_correct ? 'Correct! Well done!' : 'Keep trying!'}
                </p>
                <p className="text-sm text-slate-400">Score: {result.score}/100</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-200">{result.feedback}</p>
            </div>

            {result.exp_earned > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-semibold text-violet-300">
                  +{result.exp_earned} EXP earned!
                </span>
              </div>
            )}

            {!result.is_correct && quest.explanation && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Explanation</p>
                <p className="mt-1 text-sm text-slate-300">{quest.explanation}</p>
              </div>
            )}

            <button
              onClick={() => router.push('/student/quests')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Quests
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
