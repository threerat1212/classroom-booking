'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Award,
  BookOpen,
  Crown,
  Flame,
  RadioTower,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CommunityAchievementEvent,
  CommunityClassroomCard,
  CommunityRareHighlight,
  CommunityTopRoom,
  getCommunityDashboard,
} from '@/lib/api/dashboards'
import { apiErrorMessage } from '@/lib/http/client'

const rarityClass: Record<string, string> = {
  common: 'border-slate-500/20 bg-slate-500/10 text-slate-200',
  rare: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200',
  epic: 'border-violet-500/20 bg-violet-500/10 text-violet-200',
  legendary: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
}

function formatTime(value: string) {
  try {
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: string }) {
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${tone}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
        <Icon className="h-4 w-4 text-white/70" />
      </div>
      <p className="mt-3 text-2xl font-extrabold text-white">{value}</p>
    </div>
  )
}

function FeedItem({ event }: { event: CommunityAchievementEvent }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-rose-400 to-violet-500 text-slate-950">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-white">{event.student_name}</p>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${rarityClass[event.rarity] ?? rarityClass.common}`}>
            {event.rarity}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-300">{event.title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{event.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          {event.classroom_name && <span>{event.classroom_name}</span>}
          <span>{formatTime(event.occurred_at)}</span>
        </div>
      </div>
    </div>
  )
}

function TopRoom({ room }: { room: CommunityTopRoom }) {
  return (
    <Link
      href={`/classrooms/${room.classroom_id}/dashboard`}
      className="group block rounded-xl border border-emerald-500/15 bg-emerald-500/[0.07] p-4 transition-colors hover:bg-emerald-500/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white">{room.classroom_name}</p>
          <p className="mt-1 text-xs text-emerald-200/70">{room.student_count} students</p>
        </div>
        <ArrowRight className="h-4 w-4 text-emerald-200/50 transition-transform group-hover:translate-x-1" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-500">Total XP</p>
          <p className="mt-1 font-bold text-white">{room.total_xp}</p>
        </div>
        <div>
          <p className="text-slate-500">Recent</p>
          <p className="mt-1 font-bold text-white">{room.recent_achievement_count}</p>
        </div>
      </div>
    </Link>
  )
}

function RareHighlight({ item }: { item: CommunityRareHighlight }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200">
          <Award className="h-5 w-5" />
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${rarityClass[item.rarity] ?? rarityClass.common}`}>
          {item.rarity}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{item.name}</p>
      <p className="mt-1 text-xs text-slate-500">{item.earned_count} earned</p>
    </div>
  )
}

function ClassroomCard({ classroom }: { classroom: CommunityClassroomCard }) {
  return (
    <Link
      href={`/classrooms/${classroom.classroom_id}/dashboard`}
      className={`group block rounded-xl border p-4 transition-colors ${
        classroom.is_primary
          ? 'border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/15'
          : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white">{classroom.name}</p>
          <p className="mt-1 text-xs text-slate-500">{classroom.code}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1" />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-slate-400">
          <Users className="h-3.5 w-3.5" />
          {classroom.student_count}
        </span>
        {classroom.is_primary && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 font-semibold text-emerald-200">Primary</span>}
      </div>
    </Link>
  )
}

export default function CommunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const grade = searchParams.get('grade_level') || undefined

  const dashboardQuery = useQuery({
    queryKey: ['community-dashboard', grade],
    queryFn: async () => (await getCommunityDashboard(grade)).data,
  })

  const dashboard = dashboardQuery.data

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-200">
              <RadioTower className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Community {dashboard?.selected_grade_label ?? ''}</h1>
              <p className="mt-1 text-sm text-slate-400">Live achievements, top rooms, and highlights from your learning community</p>
            </div>
          </div>
        </div>
        {dashboard && dashboard.accessible_grades.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {dashboard.accessible_grades.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => router.push(`/community?grade_level=${item.code}`)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  item.code === dashboard.selected_grade
                    ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.display}
              </button>
            ))}
          </div>
        )}
      </div>

      {dashboardQuery.isLoading && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_.8fr]">
          <Skeleton className="h-80 bg-white/5" />
          <Skeleton className="h-80 bg-white/5" />
        </div>
      )}

      {dashboardQuery.isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="font-semibold text-red-100">Cannot load community dashboard</p>
          <p className="mt-1 text-sm text-red-200/70">{apiErrorMessage(dashboardQuery.error)}</p>
        </div>
      )}

      {dashboard && !dashboard.selected_grade && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6">
          <p className="font-semibold text-amber-100">ยังไม่ได้ตั้งค่าสายชั้น</p>
          <p className="mt-1 text-sm text-amber-100/70">ให้ครูหรือ admin ตั้งค่า grade level เช่น M3 หรือ M4 ก่อนใช้งาน Community Dashboard</p>
        </div>
      )}

      {dashboard?.selected_grade && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Students" value={dashboard.stats.student_count} icon={Users} tone="from-cyan-500/10 to-transparent border-cyan-500/10" />
            <StatCard label="Rooms" value={dashboard.stats.classroom_count} icon={BookOpen} tone="from-emerald-500/10 to-transparent border-emerald-500/10" />
            <StatCard label="Rare Badges" value={dashboard.stats.rare_badge_count} icon={Award} tone="from-violet-500/10 to-transparent border-violet-500/10" />
            <StatCard label="Quest Clears" value={dashboard.stats.quest_clear_count} icon={Zap} tone="from-amber-500/10 to-transparent border-amber-500/10" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Live Achievement Feed</h2>
                <Flame className="h-5 w-5 text-orange-300" />
              </div>
              <div className="space-y-3">
                {dashboard.feed.length > 0 ? (
                  dashboard.feed.map((event, index) => <FeedItem key={`${event.student_id}-${event.title}-${index}`} event={event} />)
                ) : (
                  <div className="rounded-lg border border-white/10 bg-slate-950/35 p-6 text-center">
                    <Sparkles className="mx-auto h-8 w-8 text-slate-600" />
                    <p className="mt-3 text-sm text-slate-400">ยังไม่มีโมเมนต์ของสายชั้นนี้</p>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-5">
              {dashboard.weekly_highlight && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
                  <div className="flex items-center gap-2 text-amber-100">
                    <Crown className="h-5 w-5" />
                    <h2 className="font-semibold">Weekly Highlight</h2>
                  </div>
                  <p className="mt-4 text-2xl font-extrabold text-white">{dashboard.weekly_highlight.full_name}</p>
                  <p className="mt-1 text-sm text-amber-100/70">
                    Lv.{dashboard.weekly_highlight.level} · {dashboard.weekly_highlight.xp} XP
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="mb-3 text-lg font-semibold text-white">Top Rooms</h2>
                <div className="space-y-3">
                  {dashboard.top_rooms.length > 0 ? (
                    dashboard.top_rooms.map((room) => <TopRoom key={room.classroom_id} room={room} />)
                  ) : (
                    <p className="text-sm text-slate-500">No rooms yet</p>
                  )}
                </div>
              </div>
            </aside>
          </div>

          <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="mb-3 text-lg font-semibold text-white">Rare Highlights</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {dashboard.rare_highlights.length > 0 ? (
                  dashboard.rare_highlights.map((item) => <RareHighlight key={item.code} item={item} />)
                ) : (
                  <p className="text-sm text-slate-500">No rare highlights yet</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Room Dashboards</h2>
                <Trophy className="h-5 w-5 text-slate-500" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {dashboard.classrooms.map((classroom) => (
                  <ClassroomCard key={classroom.classroom_id} classroom={classroom} />
                ))}
              </div>
              {dashboard.classrooms.length === 0 && <p className="text-sm text-slate-500">No classrooms in this grade yet</p>}
              {dashboard.primary_classroom_id && (
                <Button asChild className="mt-4">
                  <Link href={`/classrooms/${dashboard.primary_classroom_id}/dashboard`}>
                    Open Primary Room
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}
