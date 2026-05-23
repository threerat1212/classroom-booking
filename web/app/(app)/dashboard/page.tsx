'use client'

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

function useDashboardStats(role: string | null) {
  const canReadUsers = role === 'admin' || role === 'teacher'

  return useQueries({
    queries: [
      {
        queryKey: roomKeys.lists(),
        queryFn: listRooms,
        select: (res: { data: unknown[] }) => res.data.length,
      },
      {
        queryKey: bookingKeys.lists(),
        queryFn: listBookings,
        select: (res: { data: unknown[] }) => res.data.length,
      },
      {
        queryKey: assignmentKeys.lists(),
        queryFn: listAssignments,
        select: (res: { data: unknown[] }) => res.data.length,
      },
      {
        queryKey: userKeys.lists(),
        queryFn: async () => apiFetch<{ data: User[] }>('/api/v1/users'),
        select: (res: { data: User[] }) => res.data.filter((u) => u.role === 'student').length,
        enabled: canReadUsers,
      },
    ],
  })
}

const KPI_CONFIG = [
  { labelKey: 'total_rooms', icon: DoorOpen, gradient: 'from-blue-500/10 to-transparent', iconBg: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/10' },
  { labelKey: 'active_bookings', icon: CalendarDays, gradient: 'from-emerald-500/10 to-transparent', iconBg: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/10' },
  { labelKey: 'assignments', icon: ClipboardList, gradient: 'from-amber-500/10 to-transparent', iconBg: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/10' },
  { labelKey: 'students', icon: Users, gradient: 'from-violet-500/10 to-transparent', iconBg: 'bg-violet-500/10 text-violet-400', border: 'border-violet-500/10' },
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
      className={`group relative overflow-hidden rounded-2xl border ${item.border} bg-slate-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]`}
    >
      {/* Light border beam indicator on hover */}
      <div className="absolute inset-0 border-beam opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg}`}>
            <item.icon className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>+12%</span>
          </div>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <Skeleton className="h-8 w-16 bg-white/5" />
          ) : (
            <motion.span
              className="text-3xl font-extrabold text-white tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.15 }}
            >
              {value}
            </motion.span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-400">{t(item.labelKey as any)}</p>
          <ArrowUpRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-slate-400" />
        </div>
      </div>

      {/* Glow effect */}
      <div className={`absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${item.gradient} opacity-20 blur-3xl`} />
    </motion.div>
  )
}

const QUICK_ACTIONS = [
  { labelKey: 'new_booking', descKey: 'new_booking_desc', href: '/bookings/new', color: 'from-blue-500/10 to-transparent', border: 'border-blue-500/10', roles: ['admin', 'teacher'] },
  { labelKey: 'new_assignment', descKey: 'new_assignment_desc', href: '/assignments/new', color: 'from-amber-500/10 to-transparent', border: 'border-amber-500/10', roles: ['admin', 'teacher'] },
  { labelKey: 'view_calendar', descKey: 'view_calendar_desc', href: '/calendar', color: 'from-emerald-500/10 to-transparent', border: 'border-emerald-500/10', roles: ['admin', 'teacher', 'student', 'guest'] },
]

export default function DashboardPage() {
  const { role } = useCurrentUser()
  const { t } = useLanguage()
  const stats = useDashboardStats(role)

  const visibleActions = QUICK_ACTIONS.filter((a) => !role || a.roles.includes(role))

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('dashboard_title')}</h1>
        <p className="mt-1.5 text-sm text-slate-400">{t('dashboard_subtitle')}</p>
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
        <h2 className="mb-4 text-base font-bold text-white tracking-tight">{t('quick_actions')}</h2>
        <div className={`grid grid-cols-1 gap-4 ${visibleActions.length === 1 ? '' : 'sm:grid-cols-3'}`}>
          {visibleActions.map((action, i) => (
            <motion.a
              key={action.labelKey}
              href={action.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className={`group flex items-center justify-between rounded-2xl border ${action.border} bg-slate-900/30 p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] relative`}
            >
              <div className="absolute inset-0 border-beam opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10">
                <p className="font-bold text-white tracking-tight">{t(action.labelKey as any)}</p>
                <p className="text-xs text-slate-400 mt-1">{t(action.descKey as any)}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-500 transition-colors group-hover:text-white" />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
