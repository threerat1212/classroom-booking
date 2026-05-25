'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wand2, Plus, Zap, Star, Loader2, RefreshCw, Sparkles, Lock } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { listClassrooms, type Classroom } from '@/lib/api/classrooms'
import { listTitles, type LearningTitle } from '@/lib/api/achievements'
import { listQuests, generateQuests, createQuest, type Quest } from '@/lib/api/quests'

const emptySpecialQuest = {
  classroom_id: '',
  required_title_code: '',
  difficulty: 'medium',
  title: '',
  topic: '',
  question: '',
  answer: '',
  hints: '',
  explanation: '',
  exp_reward: '35',
  gold_reward: '25',
}

export default function TeacherQuestsPage() {
  const [topic, setTopic] = useState('')
  const [classroomID, setClassroomID] = useState('')
  const [specialQuest, setSpecialQuest] = useState(emptySpecialQuest)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const { data: classrooms } = useQuery({
    queryKey: ['teacher-classrooms'],
    queryFn: async () => {
      const res = await listClassrooms()
      return res.data
    },
  })

  const { data: titles } = useQuery({
    queryKey: ['title-catalog'],
    queryFn: async () => {
      const res = await listTitles()
      return res.data
    },
  })

  const { data: quests, isLoading, refetch } = useQuery({
    queryKey: ['teacher-quests'],
    queryFn: listQuests,
  })

  const selectedTitle = titles?.find((title) => title.code === specialQuest.required_title_code)

  const generateMutation = useMutation({
    mutationFn: generateQuests,
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

  const specialMutation = useMutation({
    mutationFn: async () => {
      const hints = specialQuest.hints
        .split('\n')
        .map((hint) => hint.trim())
        .filter(Boolean)
      return createQuest({
        classroom_id: specialQuest.classroom_id,
        required_title_code: specialQuest.required_title_code,
        quest_kind: 'special',
        difficulty: specialQuest.difficulty,
        title: specialQuest.title.trim(),
        topic: specialQuest.topic.trim(),
        question: specialQuest.question.trim(),
        answer: specialQuest.answer.trim(),
        hints,
        explanation: specialQuest.explanation.trim(),
        exp_reward: Number(specialQuest.exp_reward) || 35,
        gold_reward: Number(specialQuest.gold_reward) || 25,
        unlock_note: selectedTitle ? `ปลดล็อกด้วยฉายา ${selectedTitle.name}` : '',
      })
    },
    onSuccess: () => {
      setSpecialQuest(emptySpecialQuest)
      refetch()
    },
    onError: (err: any) => setError(err?.message || 'Create special quest failed'),
  })

  const handleGenerate = () => {
    if (!topic.trim()) return
    if (!classroomID) {
      setError('Please select a classroom')
      return
    }
    setError('')
    setGenerating(true)
    generateMutation.mutate({ topic: topic.trim(), classroom_id: classroomID })
  }

  const canCreateSpecial =
    specialQuest.classroom_id &&
    specialQuest.required_title_code &&
    specialQuest.title.trim() &&
    specialQuest.topic.trim() &&
    specialQuest.question.trim() &&
    specialQuest.answer.trim()

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
        <p className="mt-1 text-sm text-slate-400">Create AI practice quests and title-gated special quests</p>
      </div>

      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-6">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-violet-400" />
          <h2 className="text-sm font-semibold text-white">AI Quest Generator</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Enter a topic and AI will create 4 quests (Easy, Medium, Hard, Expert) automatically.
        </p>
        <div className="mt-4 space-y-3">
          <select
            value={classroomID}
            onChange={(e) => setClassroomID(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none"
          >
            <option value="" className="bg-slate-900">Select classroom</option>
            {classrooms?.map((c: Classroom) => (
              <option key={c.id} value={c.id} className="bg-slate-900">
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Multiplication, Newton's Laws, Thai History..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none"
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim() || !classroomID}
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
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-300" />
          <h2 className="text-sm font-semibold text-white">Special Quest</h2>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <select
            value={specialQuest.classroom_id}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, classroom_id: e.target.value }))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none"
          >
            <option value="" className="bg-slate-900">Select classroom</option>
            {classrooms?.map((c: Classroom) => (
              <option key={c.id} value={c.id} className="bg-slate-900">
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          <select
            value={specialQuest.required_title_code}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, required_title_code: e.target.value }))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none"
          >
            <option value="" className="bg-slate-900">Required title</option>
            {titles?.map((title: LearningTitle) => (
              <option key={title.code} value={title.code} className="bg-slate-900">
                {title.name} · {title.rarity}
              </option>
            ))}
          </select>
          <input
            value={specialQuest.title}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Special quest title"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <input
            value={specialQuest.topic}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, topic: e.target.value }))}
            placeholder="Topic"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <select
            value={specialQuest.difficulty}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, difficulty: e.target.value }))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none"
          >
            {['easy', 'medium', 'hard', 'expert'].map((difficulty) => (
              <option key={difficulty} value={difficulty} className="bg-slate-900">{difficulty}</option>
            ))}
          </select>
          <input
            value={specialQuest.exp_reward}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, exp_reward: e.target.value }))}
            placeholder="EXP"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <input
            value={specialQuest.gold_reward}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, gold_reward: e.target.value }))}
            placeholder="Gold"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <textarea
            value={specialQuest.question}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, question: e.target.value }))}
            placeholder="Question"
            rows={3}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none lg:col-span-2"
          />
          <textarea
            value={specialQuest.answer}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, answer: e.target.value }))}
            placeholder="Canonical answer"
            rows={2}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none lg:col-span-2"
          />
          <textarea
            value={specialQuest.hints}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, hints: e.target.value }))}
            placeholder="Hints, one per line"
            rows={2}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <textarea
            value={specialQuest.explanation}
            onChange={(e) => setSpecialQuest((prev) => ({ ...prev, explanation: e.target.value }))}
            placeholder="Explanation after submit"
            rows={2}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => specialMutation.mutate()}
            disabled={!canCreateSpecial || specialMutation.isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-400 disabled:opacity-40"
          >
            {specialMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Special Quest
          </button>
        </div>
      </div>

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
            <p className="text-xs text-slate-500">Use the AI generator above to create quests.</p>
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
                {quest.quest_kind === 'special' ? <Sparkles className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">{quest.title}</p>
                  {quest.quest_kind === 'special' && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-200">Special</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {quest.classroom_name && <span className="text-violet-400">{quest.classroom_name} · </span>}
                  {quest.topic} · {quest.difficulty} · +{quest.exp_reward} EXP · +{quest.gold_reward} Gold
                </p>
                {quest.required_title_name && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-amber-200">
                    <Lock className="h-3 w-3" />
                    Requires {quest.required_title_name}
                  </p>
                )}
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${diffColor(quest.difficulty)}`}>
              {quest.difficulty}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
