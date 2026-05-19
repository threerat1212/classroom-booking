'use client'

import { useQuery } from '@tanstack/react-query'
import { Award, CheckCircle, Lock, Sparkles, Zap } from 'lucide-react'
import { getLevelProgress } from '@/lib/api/unlocks'

const badgeSeeds = [
  { title: 'Early Bird', description: 'Awarded for submitting 5 assignments before the due date.' },
  { title: 'Perfect Attendance', description: 'Awarded for 100% attendance in a month.' },
]

export default function StudentBadgesPage() {
  const { data } = useQuery({
    queryKey: ['level-progress'],
    queryFn: async () => (await getLevelProgress()).data,
  })

  const progressPercent = data
    ? Math.min(100, ((data.xp - data.current_level_xp) / Math.max(1, data.next_level_xp - data.current_level_xp)) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Badges & Unlocks</h1>
        <p className="mt-1 text-sm text-slate-400">Achievements, level rewards, and challenge access</p>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-violet-200">{data?.rank_title ?? 'Novice'}</p>
              <h2 className="text-xl font-bold text-white">Level {data?.level ?? 1}</h2>
            </div>
          </div>
          <p className="text-sm font-semibold text-white">{data?.xp ?? 0} XP</p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950/60">
          <div className="h-full rounded-full bg-violet-400" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-violet-200/80">
          <span>{data?.current_level_xp ?? 0} XP</span>
          <span>{data?.next_level_xp ?? 100} XP</span>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">Level Unlocks</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(data?.unlocks ?? []).map((unlock) => (
            <div key={`${unlock.level}-${unlock.title}`} className={`rounded-xl border p-4 ${unlock.unlocked ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${unlock.unlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                  {unlock.unlocked ? <CheckCircle className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Lv.{unlock.level}</p>
                  <h3 className="text-sm font-semibold text-white">{unlock.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{unlock.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">Badges</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          {badgeSeeds.map((badge) => (
            <div key={badge.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-semibold text-white">{badge.title}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">{badge.description}</p>
            </div>
          ))}
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-300" />
              <h3 className="text-base font-semibold text-white">Quest Specialist</h3>
            </div>
            <p className="mt-2 text-sm text-slate-400">Unlocked by clearing expert quests after Lv.3.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
