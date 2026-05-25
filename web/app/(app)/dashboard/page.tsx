'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DoorOpen, CalendarDays, ClipboardList, Users, TrendingUp, ArrowUpRight } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { listRooms } from '@/lib/api/rooms'
import { listBookings } from '@/lib/api/bookings'
import { listAssignments } from '@/lib/api/assignments'
import { apiFetch } from '@/lib/http/client'
import { Skeleton } from '@/components/ui/skeleton'
import { roomKeys, bookingKeys, assignmentKeys, userKeys } from '@/lib/query/keys'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useLanguage } from '@/lib/context/language-context'

interface User {
  id: string
  role: string
}

function useDashboardStats(role: string | null, enabled: boolean) {
  const canReadUsers = role === 'admin' || role === 'teacher'

  return useQueries({
    queries: [
      {
        queryKey: roomKeys.lists(),
        queryFn: listRooms,
        select: (res: { data: unknown[] }) => res.data.length,
        enabled,
      },
      {
        queryKey: bookingKeys.lists(),
        queryFn: listBookings,
        select: (res: { data: unknown[] }) => res.data.length,
        enabled,
      },
      {
        queryKey: assignmentKeys.lists(),
        queryFn: listAssignments,
        select: (res: { data: unknown[] }) => res.data.length,
        enabled,
      },
      {
        queryKey: userKeys.lists(),
        queryFn: async () => apiFetch<{ data: User[] }>('/api/v1/users'),
        select: (res: { data: User[] }) => res.data.filter((u) => u.role === 'student').length,
        enabled: enabled && canReadUsers,
      },
    ],
  })
}

const KPI_CONFIG = [
  { labelKey: 'total_rooms', icon: DoorOpen, accent: 'bg-blue-50 text-blue-700', border: 'border-blue-100' },
  { labelKey: 'active_bookings', icon: CalendarDays, accent: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-100' },
  { labelKey: 'assignments', icon: ClipboardList, accent: 'bg-amber-50 text-amber-700', border: 'border-amber-100' },
  { labelKey: 'students', icon: Users, accent: 'bg-violet-50 text-violet-700', border: 'border-violet-100' },
] as const

function KPICard({ item, value, isLoading, index, t }: {
  item: typeof KPI_CONFIG[number];
  value: number;
  isLoading: boolean;
  index: number;
  t: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`rounded-xl border ${item.border} bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.accent}`}>
            <item.icon className="h-5 w-5" />
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300" />
        </div>

        <div className="mt-5">
          {isLoading ? (
            <Skeleton className="h-8 w-16 bg-slate-100" />
          ) : (
            <motion.span
              className="text-3xl font-black tracking-tight text-slate-950"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.15 }}
            >
              {value}
            </motion.span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">{t(item.labelKey as any)}</p>
          <div className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">
            <TrendingUp className="h-3 w-3" />
            <span>ล่าสุด</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const QUICK_ACTIONS = [
  { labelKey: 'new_booking', descKey: 'new_booking_desc', href: '/bookings/new', border: 'border-blue-100', roles: ['admin', 'teacher'] },
  { labelKey: 'new_assignment', descKey: 'new_assignment_desc', href: '/assignments/new', border: 'border-amber-100', roles: ['admin', 'teacher'] },
  { labelKey: 'view_calendar', descKey: 'view_calendar_desc', href: '/calendar', border: 'border-emerald-100', roles: ['admin', 'teacher', 'student', 'guest'] },
]

export default function DashboardPage() {
  const router = useRouter()
  const { role, isLoading } = useCurrentUser()
  const { t } = useLanguage()
  const stats = useDashboardStats(role, !isLoading && role !== 'student')

  useEffect(() => {
    if (!isLoading && role === 'student') {
      router.replace('/student/dashboard')
    }
  }, [isLoading, role, router])

  if (!isLoading && role === 'student') return null

  const visibleActions = QUICK_ACTIONS.filter((a) => !role || a.roles.includes(role))

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-black tracking-tight text-slate-950">{t('dashboard_title')}</h1>
        <p className="mt-1.5 text-sm font-medium text-slate-500">{t('dashboard_subtitle')}</p>
      </motion.div>

      {/* KPI Grid - Bento Style */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CONFIG.map((item, idx) => {
          const query = stats[idx]
          return (
            <KPICard
              key={item.labelKey}
              item={item}
              value={query.data ?? 0}
              isLoading={query.isLoading}
              index={idx}
              t={t}
            />
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="mb-4 text-base font-black tracking-tight text-slate-950">{t('quick_actions')}</h2>
        <div className={`grid grid-cols-1 gap-4 ${visibleActions.length === 1 ? '' : 'sm:grid-cols-3'}`}>
          {visibleActions.map((action, i) => (
            <motion.a
              key={action.labelKey}
              href={action.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className={`group flex items-center justify-between rounded-xl border ${action.border} bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div>
                <p className="font-black tracking-tight text-slate-950">{t(action.labelKey as any)}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{t(action.descKey as any)}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-blue-600" />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
