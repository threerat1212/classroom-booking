'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Award, Crown, Sparkles, Target, Trophy, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ClassroomBadgeWallItem, getClassroomDashboard } from '@/lib/api/dashboards'
import { apiErrorMessage } from '@/lib/http/client'

const rarityClass: Record<string, string> = {
  common: 'border-slate-500/20 bg-slate-500/10 text-slate-200',
  rare: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200',
  epic: 'border-violet-500/20 bg-violet-500/10 text-violet-200',
  legendary: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}

function BadgeWallItem({ item }: { item: ClassroomBadgeWallItem }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-rose-400 to-violet-500 text-slate-950">
          <Award className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">{item.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${rarityClass[item.rarity] ?? rarityClass.common}`}>
              {item.rarity}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{item.student_name} · {formatDate(item.earned_at)}</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-400">{item.description}</p>
        </div>
      </div>
    </div>
  )
}

export default function ClassroomDashboardPage() {
  const params = useParams<{ id: string }>()
  const dashboardQuery = useQuery({
    queryKey: ['classroom-dashboard', params.id],
    queryFn: async () => (await getClassroomDashboard(params.id)).data,
    enabled: !!params.id,
  })

  const dashboard = dashboardQuery.data
  const classroom = dashboard?.classroom

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/community">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Community
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-200">
              <BookRoomIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{classroom?.name ?? 'Room Dashboard'}</h1>
              <p className="mt-1 text-sm text-slate-400">{classroom?.code ?? 'Classroom achievement space'}</p>
            </div>
          </div>
        </div>
      </div>

      {dashboardQuery.isLoading && (
        <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
          <Skeleton className="h-80 bg-white/5" />
          <Skeleton className="h-80 bg-white/5" />
        </div>
      )}

      {dashboardQuery.isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="font-semibold text-red-100">Cannot load room dashboard</p>
          <p className="mt-1 text-sm text-red-200/70">{apiErrorMessage(dashboardQuery.error)}</p>
        </div>
      )}

      {dashboard && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-emerald-100/70">Quest Progress</p>
                <Target className="h-4 w-4 text-emerald-100/70" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-white">{dashboard.quest_progress.completion_percent}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-950/50">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${dashboard.quest_progress.completion_percent}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-cyan-100/70">Participants</p>
                <Users className="h-4 w-4 text-cyan-100/70" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-white">{dashboard.quest_progress.participant_count}</p>
              <p className="mt-1 text-xs text-cyan-100/60">{dashboard.quest_progress.completed_count} completed attempts</p>
            </div>
            <div className="rounded-xl border border-violet-500/10 bg-violet-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-violet-100/70">Badge Wall</p>
                <Award className="h-4 w-4 text-violet-100/70" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-white">{dashboard.badge_wall.length}</p>
              <p className="mt-1 text-xs text-violet-100/60">latest achievements</p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Room Leaderboard</h2>
                <Trophy className="h-5 w-5 text-amber-300" />
              </div>
              <div className="space-y-3">
                {dashboard.leaderboard.map((entry) => (
                  <div key={entry.student_id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black ${
                      entry.rank === 1 ? 'bg-amber-300 text-slate-950' : entry.rank === 2 ? 'bg-slate-300 text-slate-950' : entry.rank === 3 ? 'bg-orange-300 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {entry.rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{entry.full_name}</p>
                      <p className="text-xs text-slate-500">{entry.rank_title || `Level ${entry.level}`}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-white">
                      <Zap className="h-3.5 w-3.5 text-violet-300" />
                      {entry.xp}
                    </div>
                  </div>
                ))}
                {dashboard.leaderboard.length === 0 && <p className="text-sm text-slate-500">No students in this room yet</p>}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Badge Wall</h2>
                <Sparkles className="h-5 w-5 text-violet-300" />
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {dashboard.badge_wall.map((item) => (
                  <BadgeWallItem key={`${item.student_id}-${item.code}-${item.earned_at}`} item={item} />
                ))}
              </div>
              {dashboard.badge_wall.length === 0 && (
                <div className="rounded-lg border border-white/10 bg-slate-950/35 p-6 text-center">
                  <Award className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="mt-3 text-sm text-slate-400">No badges earned in this room yet</p>
                </div>
              )}
            </section>
          </div>

          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Room Moments</h2>
              <Crown className="h-5 w-5 text-slate-500" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {dashboard.recent_moments.map((moment, index) => (
                <div key={`${moment.student_id}-${moment.title}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-semibold text-white">{moment.student_name}</p>
                  <p className="mt-1 text-sm text-slate-300">{moment.title}</p>
                  <p className="mt-3 text-xs text-slate-500">{formatDate(moment.occurred_at)}</p>
                </div>
              ))}
            </div>
            {dashboard.recent_moments.length === 0 && <p className="text-sm text-slate-500">No room moments yet</p>}
          </section>
        </>
      )}
    </div>
  )
}

function BookRoomIcon() {
  return <Users className="h-5 w-5" />
}
