'use client'

import { ClipboardList, Users, Award, TrendingUp, Zap } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { listAssignments } from '@/lib/api/assignments'
import { listSubmissions } from '@/lib/api/submissions'
import { assignmentKeys, submissionKeys } from '@/lib/query/keys'
import { Skeleton } from '@/components/ui/skeleton'

function xpForLevel(level: number) {
  if (level <= 1) return 0
  return 50 * (level - 1) * level
}

function useStudentStats(studentId?: string) {
  return useQueries({
    queries: [
      {
        queryKey: assignmentKeys.lists(),
        queryFn: listAssignments,
        select: (res: { data: unknown[] }) => res.data.length,
        enabled: !!studentId,
      },
      {
        queryKey: submissionKeys.lists(),
        queryFn: () => listSubmissions(undefined, studentId),
        select: (res: { data: unknown[] }) => res.data.length,
        enabled: !!studentId,
      },
    ],
  })
}

export default function StudentDashboardPage() {
  const { user } = useCurrentUser()
  const stats = useStudentStats(user?.id)

  const assignmentCount = stats[0].data ?? 0
  const submissionCount = stats[1].data ?? 0
  const pendingCount = Math.max(0, assignmentCount - submissionCount)
  const isLoading = stats.some((s) => s.isLoading)

  const xp = (user as any)?.xp ?? 0
  const level = (user as any)?.level ?? 1
  const rankTitle = (user as any)?.rank_title ?? 'Novice'
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const xpProgress = nextLevelXp > currentLevelXp ? ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100 : 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Welcome back, {user?.full_name || 'Student'}</p>
        </div>
        {/* XP / Level Card */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-indigo-600/5 p-4 min-w-[220px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-violet-400" />
              <span className="text-sm font-semibold text-white">Level {level}</span>
            </div>
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">{rankTitle}</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{xp} XP</span>
              <span>{nextLevelXp} XP</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'My Assignments', value: assignmentCount, description: `${pendingCount} pending submission`, icon: ClipboardList },
          { label: 'Submissions', value: submissionCount, description: 'Submitted so far', icon: Users },
          { label: 'Pending', value: pendingCount, description: 'Awaiting submission', icon: Award },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-400">{item.label}</div>
              <item.icon className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {isLoading ? <Skeleton className="h-8 w-12" /> : item.value}
            </div>
            <div className="mt-1 text-xs text-slate-400">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
