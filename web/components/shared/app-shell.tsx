'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Button } from '@/components/ui/button'
import { AIChatWidget } from '@/components/shared/ai-chat'
import { useLanguage } from '@/lib/context/language-context'
import { 
  Calendar, Home, LogOut, Settings, Users, BookOpen, 
  ClipboardList, Award, UserCircle, DoorOpen, Bell, 
  LayoutDashboard, ChevronRight, Sparkles, Building2, Trophy, Zap, Globe
} from 'lucide-react'

interface NavSection {
  titleKey: 'nav_overview' | 'nav_management' | 'nav_academic' | 'nav_student' | 'nav_account'
  items: NavItem[]
}

interface NavItem {
  href: string
  labelKey: any
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  public?: boolean
  badge?: number
}

const navSections: NavSection[] = [
  {
    titleKey: 'nav_overview',
    items: [
      { href: '/', labelKey: 'home', icon: Building2, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
      { href: '/dashboard', labelKey: 'nav_dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
      { href: '/calendar', labelKey: 'nav_calendar', icon: Calendar, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
    ],
  },
  {
    titleKey: 'nav_management',
    items: [
      { href: '/rooms', labelKey: 'nav_rooms', icon: DoorOpen, roles: ['admin'] },
      { href: '/bookings', labelKey: 'nav_bookings', icon: Calendar, roles: ['admin', 'teacher'] },
      { href: '/users', labelKey: 'nav_users', icon: Users, roles: ['admin'] },
    ],
  },
  {
    titleKey: 'nav_academic',
    items: [
      { href: '/classrooms', labelKey: 'nav_classrooms', icon: BookOpen, roles: ['teacher', 'admin'] },
      { href: '/assignments', labelKey: 'nav_assignments', icon: ClipboardList, roles: ['teacher', 'admin'] },
      { href: '/teacher/quests', labelKey: 'nav_quests', icon: Zap, roles: ['teacher', 'admin'] },
      { href: '/attendance', labelKey: 'nav_attendance', icon: Users, roles: ['teacher', 'admin'] },
      { href: '/grades', labelKey: 'nav_grades', icon: Award, roles: ['teacher', 'admin'] },
    ],
  },
  {
    titleKey: 'nav_student',
    items: [
      { href: '/student/dashboard', labelKey: 'nav_my_dashboard', icon: Home, roles: ['student'] },
      { href: '/classrooms', labelKey: 'nav_my_classrooms', icon: BookOpen, roles: ['student'] },
      { href: '/student/assignments', labelKey: 'nav_my_assignments', icon: BookOpen, roles: ['student'] },
      { href: '/student/quests', labelKey: 'nav_quests', icon: Zap, roles: ['student'] },
      { href: '/student/leaderboard', labelKey: 'nav_leaderboard', icon: Trophy, roles: ['student'] },
      { href: '/student/notifications', labelKey: 'nav_notifications', icon: Bell, roles: ['student'], badge: 0 },
      { href: '/student/badges', labelKey: 'nav_badges', icon: Award, roles: ['student'] },
      { href: '/student/character', labelKey: 'nav_character', icon: UserCircle, roles: ['student'] },
    ],
  },
  {
    titleKey: 'nav_account',
    items: [
      { href: '/profile', labelKey: 'nav_profile', icon: UserCircle, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
      { href: '/settings', labelKey: 'nav_settings', icon: Settings, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
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
  const { lang, setLang, t } = useLanguage()

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
    <div className="flex h-screen bg-[#05070c] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/5 bg-slate-950/70 backdrop-blur-xl relative">
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

        {/* User Profile Card */}
        <div className="mx-4 mb-3 rounded-xl border border-white/5 bg-white/5 p-3 relative group">
          {user ? (
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${roleGradient} text-white text-sm font-bold shadow-md`}>
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.full_name}</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <p className="text-xs text-slate-400 capitalize">{t(user.role as any)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <UserCircle className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">Not signed in</p>
            </div>
          )}
        </div>

        {/* Language switch button placed below user info */}
        <div className="mx-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            className="w-full text-xs text-slate-400 hover:text-white justify-center gap-1.5 border border-white/5 bg-white/5 h-8 rounded-lg"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{lang === 'th' ? 'English (EN)' : 'ภาษาไทย (TH)'}</span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {visibleSections.map((section) => (
            <div key={section.titleKey} className="mb-2">
              <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {t(section.titleKey)}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
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
                          className={`absolute inset-0 rounded-lg bg-gradient-to-r ${roleGradient} opacity-10`}
                          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                      {active && (
                        <motion.div
                          layoutId="activeNavBorder"
                          className={`absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-full bg-gradient-to-b ${roleGradient}`}
                          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                      <Icon className={`relative z-10 h-4 w-4 shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className="relative z-10 flex-1">{t(item.labelKey)}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="relative z-10 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight className="relative z-10 h-3.5 w-3.5 text-white/50" />}
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
              className="w-full justify-start gap-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors text-sm"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors text-sm"
              asChild
            >
              <Link href="/login">
                <LogOut className="h-4 w-4" />
                {t('login')}
              </Link>
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#05070c] via-[#090b12] to-[#05070c]">
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>

      {/* AI Chat - only for students */}
      {user?.role === 'student' && <AIChatWidget />}
    </div>
  )
}
