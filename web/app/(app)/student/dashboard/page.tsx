'use client'

import Link from 'next/link'
import {
  Award,
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  Coins,
  FlaskConical,
  Gift,
  GraduationCap,
  Languages,
  Medal,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Assignment, listAssignments } from '@/lib/api/assignments'
import { listSubmissions, Submission } from '@/lib/api/submissions'
import { assignmentKeys, submissionKeys } from '@/lib/query/keys'
import { Skeleton } from '@/components/ui/skeleton'
import { StudentCharacterAvatar } from '@/components/shared/student-character-avatar'
import { cn } from '@/lib/utils'

function xpForLevel(level: number) {
  if (level <= 1) return 0
  return 50 * (level - 1) * level
}

function formatDueDate(value?: string) {
  if (!value) return 'ไม่มีกำหนด'
  try {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function daysUntil(value?: string) {
  if (!value) return null
  const due = new Date(value).getTime()
  if (Number.isNaN(due)) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((due - today.getTime()) / 86400000)
}

function dueTone(days: number | null) {
  if (days === null) return 'bg-slate-100 text-slate-600'
  if (days <= 1) return 'bg-rose-100 text-rose-600'
  if (days <= 3) return 'bg-amber-100 text-amber-700'
  return 'bg-blue-100 text-blue-700'
}

function useStudentDashboardData(studentId?: string) {
  return useQueries({
    queries: [
      {
        queryKey: assignmentKeys.lists(),
        queryFn: listAssignments,
        enabled: !!studentId,
      },
      {
        queryKey: submissionKeys.lists(),
        queryFn: () => listSubmissions(undefined, studentId),
        enabled: !!studentId,
      },
    ],
  })
}

const fallbackMissions = [
  {
    title: 'คณิตศาสตร์',
    subtitle: 'สมการเชิงเส้นตัวแปรเดียว',
    meta: 'ดูวิดีโอ + ทำแบบฝึกหัด',
    icon: BookOpen,
    progress: 75,
    xp: 150,
    href: '/student/assignments',
    color: 'from-blue-500 to-blue-600',
    bar: 'bg-blue-600',
    cta: 'border-blue-600 bg-blue-600 text-white shadow-blue-200 group-hover:bg-blue-700',
  },
  {
    title: 'วิทยาศาสตร์',
    subtitle: 'ปฏิกิริยาเคมีในชีวิตประจำวัน',
    meta: 'อ่านบทเรียน + ทำแบบทดสอบ',
    icon: FlaskConical,
    progress: 40,
    xp: 150,
    href: '/student/quests',
    color: 'from-emerald-500 to-green-600',
    bar: 'bg-emerald-500',
    cta: 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-200 group-hover:bg-emerald-600',
  },
  {
    title: 'ภาษาอังกฤษ',
    subtitle: 'Past Simple Tense',
    meta: 'ทำแบบฝึกหัด 10 ข้อ',
    icon: Languages,
    progress: 20,
    xp: 100,
    href: '/student/assignments',
    color: 'from-amber-400 to-orange-500',
    bar: 'bg-amber-500',
    cta: 'border-orange-500 bg-orange-500 text-white shadow-orange-200 group-hover:bg-orange-600',
  },
]

const bonusQuests = [
  { title: 'นักอ่านตัวจริง', detail: 'อ่านบทเรียนครบ 5 บท', progress: 3, total: 5, xp: 200, icon: Trophy, tone: 'bg-violet-100 text-violet-700' },
  { title: 'อัจฉริยะนักคิด', detail: 'ทำแบบทดสอบถูก 90% ขึ้นไป', progress: 60, total: 90, xp: 250, icon: Brain, tone: 'bg-emerald-100 text-emerald-700' },
  { title: 'ช่วยเพื่อน', detail: 'ตอบคำถามเพื่อน 3 ครั้ง', progress: 1, total: 3, xp: 150, icon: Users, tone: 'bg-purple-100 text-purple-700' },
]

const subjectProgress = [
  { label: 'คณิตศาสตร์', xp: 620, progress: 72, icon: BookOpen, tone: 'bg-blue-100 text-blue-700', bar: 'bg-blue-600' },
  { label: 'วิทยาศาสตร์', xp: 540, progress: 68, icon: FlaskConical, tone: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  { label: 'ภาษาอังกฤษ', xp: 680, progress: 75, icon: Languages, tone: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  { label: 'สังคมศึกษา', xp: 420, progress: 60, icon: Users, tone: 'bg-violet-100 text-violet-700', bar: 'bg-violet-500' },
  { label: 'ภาษาไทย', xp: 720, progress: 80, icon: GraduationCap, tone: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' },
]

const communityMoments = [
  { name: 'ต้นน้ำ', text: 'ทำคะแนนแบบทดสอบวิทย์ได้ 100%', time: '2 นาทีที่แล้ว', icon: Trophy },
  { name: 'ใบเตย', text: 'ได้รับ Badge ใหม่ นักอ่านตัวจริง', time: '15 นาทีที่แล้ว', icon: Medal },
  { name: 'พีท', text: 'ทำภารกิจประจำวันครบ 3 ภารกิจ', time: '1 ชั่วโมงที่แล้ว', icon: Zap },
]

export default function StudentDashboardPage() {
  const { user } = useCurrentUser()
  const stats = useStudentDashboardData(user?.id)

  const assignments = stats[0].data?.data ?? []
  const submissions = stats[1].data?.data ?? []
  const submittedAssignmentIds = new Set(submissions.map((submission: Submission) => submission.assignment_id))
  const pendingAssignments = assignments.filter((assignment: Assignment) => !submittedAssignmentIds.has(assignment.id))
  const assignmentCount = assignments.length
  const submissionCount = submissions.length
  const pendingCount = Math.max(0, pendingAssignments.length)
  const isLoading = stats.some((s) => s.isLoading)

  const xp = user?.xp ?? 0
  const level = user?.level ?? 1
  const gold = user?.gold_balance ?? 0
  const rankTitle = user?.rank_title ?? 'นักเรียนผู้มุ่งมั่น'
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const xpProgress = nextLevelXp > currentLevelXp ? ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100 : 100

  const missions = pendingAssignments.slice(0, 3).map((assignment: Assignment, index: number) => {
    const fallback = fallbackMissions[index] ?? fallbackMissions[0]
    return {
      ...fallback,
      title: assignment.title,
      subtitle: assignment.description || fallback.subtitle,
      meta: `${assignment.assignment_type || 'งานที่มอบหมาย'} · ${formatDueDate(assignment.due_date)}`,
      progress: Math.max(15, 80 - index * 22),
      href: `/student/submissions/${assignment.id}`,
    }
  })

  const missionCards = missions.length > 0 ? missions : fallbackMissions
  const dailyDone = Math.min(3, submissionCount + Math.max(0, 3 - pendingCount))

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="learning-gradient-border learning-sheen rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-sky-50 to-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-500">
                <Star className="h-7 w-7 fill-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">ภารกิจการเรียนวันนี้</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">ทำภารกิจหลักให้สำเร็จ รับ XP และเติบโตไปด้วยกัน!</p>
              </div>
            </div>
            <div className="flex w-fit items-center gap-3 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
              <CalendarCheck className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">ภารกิจประจำวัน</span>
              <span className="text-base font-black text-slate-950">{dailyDone} / 5</span>
              <CheckCircle2 className="h-5 w-5 fill-emerald-500 text-white" />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {missionCards.map((mission) => (
              <Link
                key={`${mission.title}-${mission.href}`}
                href={mission.href}
                className="learning-sheen group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', mission.color)}>
                    <mission.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-950">{mission.title}</h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm font-medium leading-5 text-slate-600">{mission.subtitle}</p>
                    <p className="mt-2 truncate text-xs font-semibold text-slate-400">{mission.meta}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className={cn('progress-shine h-full rounded-full', mission.bar)} style={{ width: `${mission.progress}%` }} />
                  </div>
                  <span className="text-xs font-black text-slate-700">{mission.progress}%</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-black text-amber-500">XP {mission.xp}</span>
                  <span className={cn('rounded-full border px-4 py-2 text-xs font-black shadow-sm transition-colors', mission.cta)}>ทำต่อ</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="relative h-44 overflow-hidden rounded-t-xl bg-gradient-to-br from-sky-400 via-sky-200 to-white">
            <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.9)_0_11%,transparent_12%),radial-gradient(circle_at_84%_22%,rgba(255,255,255,0.78)_0_9%,transparent_10%)]" />
            <div className="absolute -bottom-4 left-0 h-20 w-32 rounded-tr-[48px] bg-emerald-300/45" />
            <div className="absolute -bottom-7 left-20 h-24 w-36 rounded-t-full bg-emerald-200/55" />
            <div className="absolute bottom-0 right-7 h-24 w-44 rounded-t-2xl border border-white/75 bg-white/65 shadow-sm backdrop-blur-[1px]">
              <div className="h-6 rounded-t-2xl bg-blue-100/75" />
              <div className="grid grid-cols-4 gap-1.5 p-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <span key={index} className="h-5 rounded bg-sky-200/80" />
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 to-transparent" />
            <div className="absolute left-1/2 top-7 -translate-x-1/2">
              <StudentCharacterAvatar
                name={user?.full_name}
                className="h-28 w-28 border-[5px] border-white shadow-xl ring-1 ring-blue-100"
              />
            </div>
          </div>
          <div className="relative -mt-4 p-5 pt-0">
            <div className="relative z-10 inline-flex items-center rounded-xl bg-blue-600 px-3 py-1 text-lg font-black text-white shadow-sm shadow-blue-200">Lv. {level}</div>
            <div className="mt-3 flex items-center gap-3">
              <h2 className="min-w-0 flex-1 truncate text-base font-black text-slate-950">{rankTitle}</h2>
              <span className="shrink-0 text-xs font-bold text-slate-500">{xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="progress-shine h-full rounded-full bg-blue-600" style={{ width: `${Math.min(Math.max(xpProgress, 6), 100)}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <div>
                <p className="text-xl font-black text-blue-600">{submissionCount || 4}</p>
                <p className="text-xs font-bold text-slate-500">อันดับของฉัน</p>
                <p className="text-xs font-black text-slate-700">#128</p>
              </div>
              <div>
                <p className="text-xl font-black text-slate-950">Top 12%</p>
                <p className="text-xs font-bold text-slate-500">ของระดับชั้น</p>
                <p className="text-xs font-black text-slate-700">ม.3</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-950">งานที่ต้องส่ง</h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{pendingCount || 3} งาน</span>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 rounded-xl bg-slate-100" />
                <Skeleton className="h-16 rounded-xl bg-slate-100" />
                <Skeleton className="h-16 rounded-xl bg-slate-100" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {(pendingAssignments.length > 0 ? pendingAssignments.slice(0, 3) : assignments.slice(0, 3)).map((assignment: Assignment, index: number) => {
                  const days = daysUntil(assignment.due_date)
                  const Icon = [BookOpen, FlaskConical, Languages][index] ?? BookOpen
                  return (
                    <Link key={assignment.id} href={`/student/submissions/${assignment.id}`} className="flex items-center gap-3 py-3 transition-colors hover:bg-slate-50">
                      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white', ['bg-violet-500', 'bg-emerald-500', 'bg-orange-500'][index] ?? 'bg-blue-600')}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-950">{assignment.title}</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{assignment.assignment_type || 'งานที่มอบหมาย'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500">ครบกำหนด</p>
                        <p className="text-xs font-black text-slate-700">{formatDueDate(assignment.due_date)}</p>
                      </div>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-black', dueTone(days))}>
                        {days === null ? 'เปิดอยู่' : days <= 0 ? 'วันนี้' : `เหลือ ${days} วัน`}
                      </span>
                    </Link>
                  )
                })}
                {assignments.length === 0 && pendingAssignments.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-3 text-sm font-bold text-slate-600">ยังไม่มีงานที่ต้องส่งตอนนี้</p>
                  </div>
                )}
              </div>
            )}
            <Link href="/student/assignments" className="mt-4 flex items-center justify-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700">
              ดูทั้งหมด
              <Zap className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-black text-slate-950">เควสเสริม</h2>
              </div>
              <Link href="/student/quests" className="text-xs font-black text-blue-600">ดูทั้งหมด</Link>
            </div>
            <div className="space-y-3">
              {bonusQuests.map((quest) => {
                const percent = Math.min(100, (quest.progress / quest.total) * 100)
                return (
                  <Link key={quest.title} href="/student/quests" className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-blue-200 hover:shadow-sm">
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', quest.tone)}>
                      <quest.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-950">{quest.title}</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-500">{quest.detail}</p>
                        </div>
                        <span className="text-sm font-black text-amber-500">XP {quest.xp}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="progress-shine h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-500">{quest.progress} / {quest.total}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <Panel title="Badge ใหม่" actionHref="/student/badges">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'นักเรียนดีเด่น', icon: Medal, tone: 'from-blue-100 to-sky-50 text-blue-700' },
                { label: 'ตรงต่อเวลา', icon: Clock, tone: 'from-amber-100 to-yellow-50 text-amber-700' },
                { label: 'ขยันหมั่นเพียร', icon: Brain, tone: 'from-emerald-100 to-green-50 text-emerald-700' },
                { label: 'นักสำรวจ', icon: ShieldCheck, tone: 'from-slate-100 to-slate-50 text-slate-500' },
              ].map((badge) => (
                <div key={badge.label} className="text-center">
                  <div className={cn('soft-float mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm', badge.tone)}>
                    <badge.icon className="h-7 w-7" />
                  </div>
                  <p className="mt-2 text-[11px] font-bold leading-4 text-slate-600">{badge.label}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="ร้านรางวัล" actionHref="/student/rewards" tone="border-orange-100 bg-orange-50/60">
            <div className="flex items-center gap-4 rounded-xl border border-orange-100 bg-white p-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 text-orange-600">
                <Gift className="h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-950">กล่องสุ่มสติกเกอร์</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500">
                  ใช้ <Coins className="h-3.5 w-3.5 text-amber-500" /> Gold 300
                </p>
              </div>
              <Link href="/student/rewards" className="rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-blue-700">
                แลกเลย
              </Link>
            </div>
          </Panel>

          <Panel title="ชุมชนเพื่อน" actionHref="/community" tone="border-emerald-100 bg-emerald-50/60">
            <div className="space-y-3">
              {communityMoments.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-blue-600 shadow-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-950">{item.name}</p>
                    <p className="truncate text-xs font-semibold text-slate-500">{item.text}</p>
                  </div>
                  <item.icon className="h-5 w-5 text-amber-500" />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-black text-slate-950">ความคืบหน้า</h2>
              <p className="text-xs font-bold text-slate-400">เก่งขึ้นทุกวัน ไม่มีหยุด!</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {subjectProgress.map((subject) => (
              <div key={subject.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', subject.tone)}>
                  <subject.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-black text-slate-950">{subject.label}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">ระดับความเข้าใจ</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={cn('progress-shine h-full rounded-full', subject.bar)} style={{ width: `${subject.progress}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-black">
                  <span className="text-amber-500">XP {subject.xp}</span>
                  <span className="text-slate-500">{subject.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-950">กราฟพัฒนาการเรียน</h2>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">สัปดาห์นี้</span>
          </div>
          <svg viewBox="0 0 240 160" className="h-40 w-full" role="img" aria-label="Learning progress chart">
            <path d="M24 128H220" stroke="#E2E8F0" strokeWidth="2" />
            <path d="M24 96H220M24 64H220M24 32H220" stroke="#EEF2F7" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M28 118L60 76L92 94L124 72L156 66L188 82L216 52" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {[28, 60, 92, 124, 156, 188, 216].map((x, index) => (
              <circle key={x} cx={x} cy={[118, 76, 94, 72, 66, 82, 52][index]} r="5" fill="#2563EB" stroke="white" strokeWidth="3" />
            ))}
            <text x="176" y="34" fill="#16A34A" fontSize="18" fontWeight="800">+15%</text>
          </svg>
        </div>
      </section>
    </div>
  )
}

function Panel({
  title,
  actionHref,
  children,
  tone,
}: {
  title: string
  actionHref: string
  children: React.ReactNode
  tone?: string
}) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', tone)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <Link href={actionHref} className="text-xs font-black text-blue-600 hover:text-blue-700">ดูทั้งหมด</Link>
      </div>
      {children}
    </section>
  )
}
