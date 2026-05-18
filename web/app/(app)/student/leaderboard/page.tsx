'use client'

import { Trophy, Zap, Medal } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/http/client'
import { Skeleton } from '@/components/ui/skeleton'

interface LeaderboardUser {
  id: string
  full_name: string
  xp: number
  level: number
  rank_title?: string
}

function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await apiFetch<{ data: LeaderboardUser[] }>('/api/v1/leaderboard')
      return res.data
    },
  })
}

const rankColors = [
  'from-yellow-500/20 to-amber-600/5 border-yellow-500/30 text-yellow-400',
  'from-slate-400/20 to-slate-500/5 border-slate-400/30 text-slate-300',
  'from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400',
]

export default function LeaderboardPage() {
  const { data: users, isLoading } = useLeaderboard()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="mt-1 text-sm text-slate-400">Top students ranked by XP</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-white/5" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {users?.map((user, idx) => {
          const rankStyle = idx < 3 ? rankColors[idx] : 'from-white/5 to-white/[0.02] border-white/10 text-slate-300'
          const isTop3 = idx < 3
          return (
            <div
              key={user.id}
              className={`flex items-center gap-4 rounded-xl border bg-gradient-to-r p-4 ${rankStyle}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                {isTop3 ? (
                  <Medal className={`h-6 w-6 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : 'text-orange-400'}`} />
                ) : (
                  <span className="text-lg font-bold text-slate-500">{idx + 1}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white">{user.full_name}</p>
                  {isTop3 && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      #{idx + 1}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{user.rank_title || 'Novice'}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-bold text-white">
                    <Zap className="h-3.5 w-3.5 text-violet-400" />
                    {user.xp}
                  </div>
                  <p className="text-[10px] text-slate-400">XP</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">Lv.{user.level}</div>
                  <p className="text-[10px] text-slate-400">Level</p>
                </div>
              </div>
            </div>
          )
        })}
        {!isLoading && (!users || users.length === 0) && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
            <Trophy className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-2 text-sm text-slate-400">No students on the leaderboard yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
