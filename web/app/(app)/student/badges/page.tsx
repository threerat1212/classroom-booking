'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Award, CheckCircle, Crown, Flame, Gem, Lock, Medal, ShieldCheck, Sparkles, Target, Trophy, Zap } from 'lucide-react'
import { getLevelProgress } from '@/lib/api/unlocks'
import { equipTitle, getMyAchievements } from '@/lib/api/achievements'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const rarityClass: Record<string, string> = {
  common: 'border-slate-500/20 bg-slate-500/10 text-slate-200',
  rare: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200',
  epic: 'border-violet-500/20 bg-violet-500/10 text-violet-200',
  legendary: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
}

const badgeVisual: Record<string, { icon: any; gradient: string; ring: string }> = {
  first_quest_clear: {
    icon: Sparkles,
    gradient: 'from-emerald-400 via-cyan-400 to-sky-500',
    ring: 'shadow-emerald-500/20',
  },
  perfect_quest: {
    icon: Target,
    gradient: 'from-cyan-300 via-blue-400 to-violet-500',
    ring: 'shadow-cyan-500/20',
  },
  hard_streak_5_days: {
    icon: Flame,
    gradient: 'from-orange-300 via-rose-400 to-fuchsia-500',
    ring: 'shadow-orange-500/20',
  },
  first_expert_clear_unique: {
    icon: Crown,
    gradient: 'from-amber-200 via-yellow-400 to-orange-500',
    ring: 'shadow-amber-500/25',
  },
}

function BadgeMedallion({ code, rarity, earned }: { code: string; rarity: string; earned: boolean }) {
  const visual = badgeVisual[code] || {
    icon: rarity === 'legendary' ? Crown : rarity === 'epic' ? Gem : rarity === 'rare' ? Medal : Award,
    gradient: rarity === 'legendary'
      ? 'from-amber-200 via-yellow-400 to-orange-500'
      : rarity === 'epic'
      ? 'from-violet-300 via-fuchsia-400 to-pink-500'
      : rarity === 'rare'
      ? 'from-cyan-300 via-sky-400 to-blue-500'
      : 'from-slate-300 via-slate-400 to-slate-600',
    ring: rarity === 'legendary' ? 'shadow-amber-500/25' : 'shadow-slate-500/10',
  }
  const Icon = visual.icon

  return (
    <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${visual.gradient} p-[2px] shadow-lg ${visual.ring} ${earned ? '' : 'grayscale opacity-45'}`}>
      <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950/80">
        <Icon className="h-8 w-8 text-white" />
      </div>
      {earned && (
        <div className="absolute -right-1 -top-1 rounded-full border border-emerald-300/40 bg-emerald-400 p-1 text-slate-950">
          <CheckCircle className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  )
}

export default function StudentBadgesPage() {
  const qc = useQueryClient()
  const { refreshUser } = useCurrentUser()
  const { data } = useQuery({
    queryKey: ['level-progress'],
    queryFn: async () => (await getLevelProgress()).data,
  })
  const { data: achievementData } = useQuery({
    queryKey: ['my-achievements'],
    queryFn: async () => (await getMyAchievements()).data,
  })

  const equipMutation = useMutation({
    mutationFn: equipTitle,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['my-achievements'] }),
        qc.invalidateQueries({ queryKey: ['level-progress'] }),
        refreshUser().catch(() => undefined),
      ])
    },
  })

  const progressPercent = data
    ? Math.min(100, ((data.xp - data.current_level_xp) / Math.max(1, data.next_level_xp - data.current_level_xp)) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Titles & Achievements</h1>
        <p className="mt-1 text-sm text-slate-400">Collect titles, unlock special quests, and show progress</p>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-violet-200">{achievementData?.equipped_title?.name ?? data?.rank_title ?? 'Novice'}</p>
              <h2 className="text-xl font-bold text-white">Level {data?.level ?? 1}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{data?.xp ?? 0} XP</p>
            <p className="text-xs text-violet-200/80">{achievementData?.special_quest_count ?? 0} special quests unlocked</p>
          </div>
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
        <h2 className="text-lg font-semibold text-white">Titles</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(achievementData?.titles ?? []).map((title) => {
            const unlocked = title.is_unlocked
            return (
              <div key={title.code} className={`rounded-xl border p-4 ${unlocked ? rarityClass[title.rarity] : 'border-white/10 bg-white/5 text-slate-400'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${unlocked ? 'bg-white/10 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {unlocked ? <Trophy className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{title.name}</h3>
                        {title.is_unique && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-200">ONE OWNER</span>}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{title.description}</p>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{title.rarity}</p>
                    </div>
                  </div>
                </div>
                {unlocked && (
                  <button
                    disabled={title.is_equipped || equipMutation.isPending}
                    onClick={() => equipMutation.mutate(title.code)}
                    className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                  >
                    {title.is_equipped ? 'Equipped' : 'Equip Title'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">Achievement Badges</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          {(achievementData?.achievements ?? []).map((achievement) => (
            <div key={achievement.code} className={`rounded-xl border p-4 ${achievement.is_earned ? 'border-white/15 bg-white/[0.06]' : 'border-white/10 bg-white/[0.035]'}`}>
              <div className="flex items-start gap-4">
                <BadgeMedallion code={achievement.code} rarity={achievement.rarity} earned={achievement.is_earned} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-white">{achievement.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${rarityClass[achievement.rarity] ?? rarityClass.common}`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{achievement.description}</p>
                  {achievement.title && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-violet-200">
                      <Sparkles className="h-3.5 w-3.5" />
                      Unlocks title: {achievement.title.name}
                    </p>
                  )}
                  {!achievement.is_earned && (
                    <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/45 px-2 py-1 text-[10px] font-semibold text-slate-500">
                      <ShieldCheck className="h-3 w-3" />
                      Locked Badge
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
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
    </div>
  )
}
