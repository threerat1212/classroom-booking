'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Button } from '@/components/ui/button'
import { AIChatWidget } from '@/components/shared/ai-chat'
import { 
  Calendar, Home, LogOut, Settings, Users, BookOpen, 
  ClipboardList, Award, UserCircle, DoorOpen, Bell, 
  LayoutDashboard, ChevronRight, Sparkles, Building2, Trophy, Zap
} from 'lucide-react'

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  public?: boolean
  badge?: number
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/', label: 'หน้าหลัก', icon: Building2, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
      { href: '/calendar', label: 'Calendar', icon: Calendar, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
    ],
  },
  {
    title: 'Management',
    items: [
      { href: '/rooms', label: 'Rooms', icon: DoorOpen, roles: ['admin'] },
      { href: '/bookings', label: 'Bookings', icon: Calendar, roles: ['admin', 'teacher'] },
      { href: '/users', label: 'Users', icon: Users, roles: ['admin'] },
    ],
  },
  {
    title: 'Academic',
    items: [
      { href: '/classrooms', label: 'Classrooms', icon: BookOpen, roles: ['teacher', 'admin'] },
      { href: '/assignments', label: 'Assignments', icon: ClipboardList, roles: ['teacher', 'admin'] },
      { href: '/teacher/quests', label: 'Learning Quests', icon: Zap, roles: ['teacher', 'admin'] },
      { href: '/attendance', label: 'Attendance', icon: Users, roles: ['teacher', 'admin'] },
      { href: '/grades', label: 'Grades', icon: Award, roles: ['teacher', 'admin'] },
    ],
  },
  {
    title: 'Student',
    items: [
      { href: '/student/dashboard', label: 'My Dashboard', icon: Home, roles: ['student'] },
      { href: '/classrooms', label: 'My Classrooms', icon: BookOpen, roles: ['student'] },
      { href: '/student/assignments', label: 'My Assignments', icon: BookOpen, roles: ['student'] },
      { href: '/student/quests', label: 'Learning Quests', icon: Zap, roles: ['student'] },
      { href: '/student/leaderboard', label: 'Leaderboard', icon: Trophy, roles: ['student'] },
      { href: '/student/notifications', label: 'Notifications', icon: Bell, roles: ['student'], badge: 0 },
      { href: '/student/badges', label: 'Badges', icon: Award, roles: ['student'] },
      { href: '/student/character', label: 'My Character', icon: UserCircle, roles: ['student'] },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/profile', label: 'Profile', icon: UserCircle, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
      { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
    ],
  },
]

const roleColors: Record<string, string> = {
  admin: 'from-violet-500 to-purple-600',
  teacher: 'from-blue-500 to-indigo-600',
  student: 'from-emerald-500 to-teal-600',
  guest: 'from-slate-500 to-gray-600',
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, signOut } = useCurrentUser()

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => item.public || (user && item.roles.includes(user.role)),
      ),
    }))
    .filter((section) => section.items.length > 0)

  const roleGradient = user ? roleColors[user.role] || roleColors.guest : roleColors.guest

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/5 bg-slate-900/80 backdrop-blur-xl">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 px-5 py-5 transition-colors hover:bg-white/5"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${roleGradient} text-white shadow-lg`}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Classroom MS</h2>
          </div>
        </Link>

        {/* User Profile */}
        <div className="mx-4 mb-3 rounded-xl border border-white/5 bg-white/5 p-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${roleGradient} text-white text-sm font-bold shadow-md`}>
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.full_name}</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-slate-400">
                <UserCircle className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">Not signed in</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {visibleSections.map((section) => (
            <div key={section.title} className="mb-4">
              <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'text-white'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeNav"
                          className={`absolute inset-0 rounded-lg bg-gradient-to-r ${roleGradient} opacity-20`}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {active && (
                        <motion.div
                          layoutId="activeNavBorder"
                          className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b ${roleGradient}`}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <Icon className={`relative z-10 h-4 w-4 shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className="relative z-10 flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="relative z-10 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight className="relative z-10 h-3.5 w-3.5 text-white/60" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-white/5 p-3">
          {user ? (
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
              asChild
            >
              <Link href="/login">
                <LogOut className="h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>

      {/* AI Chat - only for students */}
      {user?.role === 'student' && <AIChatWidget />}
    </div>
  )
}
