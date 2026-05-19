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
  { label: 'Total Rooms', description: 'Available spaces', icon: DoorOpen, gradient: 'from-blue-500/20 to-blue-600/5', iconBg: 'bg-blue-500/20 text-blue-400', border: 'border-blue-500/20' },
  { label: 'Active Bookings', description: 'Reservations', icon: CalendarDays, gradient: 'from-emerald-500/20 to-emerald-600/5', iconBg: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/20' },
  { label: 'Assignments', description: 'Published tasks', icon: ClipboardList, gradient: 'from-amber-500/20 to-amber-600/5', iconBg: 'bg-amber-500/20 text-amber-400', border: 'border-amber-500/20' },
  { label: 'Students', description: 'Registered users', icon: Users, gradient: 'from-violet-500/20 to-violet-600/5', iconBg: 'bg-violet-500/20 text-violet-400', border: 'border-violet-500/20' },
] as const

function KPICard({ item, value, isLoading, index }: { 
  item: typeof KPI_CONFIG[number]; 
  value: number; 
  isLoading: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`group relative overflow-hidden rounded-2xl border ${item.border} bg-gradient-to-br ${item.gradient} p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg}`}>
            <item.icon className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-0.5 rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>+12%</span>
          </div>
        </div>
        <div className="mt-4">
          {isLoading ? (
            <Skeleton className="h-8 w-16 bg-white/10" />
          ) : (
            <motion.span 
              className="text-3xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {value}
            </motion.span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm text-slate-400">{item.label}</p>
          <ArrowUpRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-slate-400" />
        </div>
      </div>
      {/* Glow effect */}
      <div className={`absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${item.gradient} opacity-50 blur-3xl`} />
    </motion.div>
  )
}

const QUICK_ACTIONS = [
  { label: 'New Booking', desc: 'Reserve a room', href: '/bookings/new', color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', roles: ['admin', 'teacher'] },
  { label: 'New Assignment', desc: 'Create task', href: '/assignments/new', color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20', roles: ['admin', 'teacher'] },
  { label: 'View Calendar', desc: 'See schedule', href: '/calendar', color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', roles: ['admin', 'teacher', 'student', 'guest'] },
]

export default function DashboardPage() {
  const { role } = useCurrentUser()
  const stats = useDashboardStats(role)

  const visibleActions = QUICK_ACTIONS.filter((a) => !role || a.roles.includes(role))

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Overview of your classroom and meeting room management</p>
      </motion.div>

      {/* KPI Grid - Bento Style */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CONFIG.map((item, idx) => {
          const query = stats[idx]
          return (
            <KPICard
              key={item.label}
              item={item}
              value={query.data ?? 0}
              isLoading={query.isLoading}
              index={idx}
            />
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
        <div className={`grid grid-cols-1 gap-3 ${visibleActions.length === 1 ? '' : 'sm:grid-cols-3'}`}>
          {visibleActions.map((action, i) => (
            <motion.a
              key={action.label}
              href={action.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className={`group flex items-center justify-between rounded-2xl border ${action.border} bg-gradient-to-br ${action.color} p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}
            >
              <div>
                <p className="font-semibold text-white">{action.label}</p>
                <p className="text-xs text-slate-400">{action.desc}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-500 transition-colors group-hover:text-white" />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
