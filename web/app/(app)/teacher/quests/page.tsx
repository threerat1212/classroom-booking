'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wand2, Plus, Zap, Star, Loader2, Trash2, RefreshCw } from 'lucide-react'
import { apiFetch } from '@/lib/http/client'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface Quest {
  id: string
  title: string
  topic: string
  difficulty: string
  exp_reward: number
  status: string
}

export default function TeacherQuestsPage() {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const { data: quests, isLoading, refetch } = useQuery({
    queryKey: ['teacher-quests'],
    queryFn: async () => {
      const res = await apiFetch<{ data: Quest[] }>('/api/v1/quests')
      return res.data
    },
  })

  const generateMutation = useMutation({
    mutationFn: async (topicInput: string) => {
      const res = await apiFetch<{ data: Quest[] }>('/api/v1/quests/generate', {
        method: 'POST',
        body: JSON.stringify({ topic: topicInput }),
      })
      return res.data
    },
    onSuccess: () => {
      setTopic('')
      setGenerating(false)
      refetch()
    },
    onError: (err: any) => {
      setError(err?.message || 'Generation failed')
      setGenerating(false)
    },
  })

  const handleGenerate = () => {
    if (!topic.trim()) return
    setError('')
    setGenerating(true)
    generateMutation.mutate(topic.trim())
  }

  const diffColor = (d: string) => {
    const map: Record<string, string> = {
      easy: 'bg-emerald-500/20 text-emerald-400',
      medium: 'bg-amber-500/20 text-amber-400',
      hard: 'bg-orange-500/20 text-orange-400',
      expert: 'bg-red-500/20 text-red-400',
    }
    return map[d] || map.easy
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Learning Quests</h1>
        <p className="mt-1 text-sm text-slate-400">Create AI-generated practice quests for students</p>
      </div>

      {/* AI Generator */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-6">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-violet-400" />
          <h2 className="text-sm font-semibold text-white">AI Quest Generator</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Enter a topic and AI will create 4 quests (Easy, Medium, Hard, Expert) automatically.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Multiplication, Newton's Laws, Thai History..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" /> Generate Quests
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>

      {/* Quest List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">All Quests</h2>
          <button onClick={() => refetch()} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {isLoading && (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
          </div>
        )}

        {!isLoading && (!quests || quests.length === 0) && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <Zap className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-2 text-sm text-slate-400">No quests yet</p>
            <p className="text-xs text-slate-500">Use the AI generator above to create quests!</p>
          </div>
        )}

        {quests?.map((quest, idx) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/[0.07]"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${diffColor(quest.difficulty)}`}>
                <Star className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{quest.title}</p>
                <p className="text-xs text-slate-400">{quest.topic} · {quest.difficulty} · +{quest.exp_reward} EXP</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${diffColor(quest.difficulty)}`}>
                {quest.difficulty}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
