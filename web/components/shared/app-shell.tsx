'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Button } from '@/components/ui/button'
import { AIChatWidget } from '@/components/shared/ai-chat'
import { StudentCharacterAvatar } from '@/components/shared/student-character-avatar'
import { useLanguage } from '@/lib/context/language-context'
import { cn } from '@/lib/utils'
import {
  Award,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Coins,
  DoorOpen,
  Flame,
  Gift,
  Globe,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  RadioTower,
  Settings,
  Sparkles,
  Star,
  Trophy,
  UserCircle,
  Users,
  X,
  Zap,
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
      { href: '/', labelKey: 'home', icon: Home, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
      { href: '/dashboard', labelKey: 'nav_dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'guest'], public: true },
      { href: '/community', labelKey: 'nav_community', icon: RadioTower, roles: ['admin', 'teacher', 'student'] },
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
      { href: '/teacher/rewards', labelKey: 'nav_reward_requests', icon: Gift, roles: ['teacher', 'admin'] },
      { href: '/attendance', labelKey: 'nav_attendance', icon: Users, roles: ['teacher', 'admin'] },
      { href: '/grades', labelKey: 'nav_grades', icon: Award, roles: ['teacher', 'admin'] },
    ],
  },
  {
    titleKey: 'nav_student',
    items: [
      { href: '/student/dashboard', labelKey: 'nav_my_dashboard', icon: Home, roles: ['student'] },
      { href: '/classrooms', labelKey: 'nav_my_classrooms', icon: BookOpen, roles: ['student'] },
      { href: '/student/assignments', labelKey: 'nav_my_assignments', icon: ClipboardList, roles: ['student'], badge: 3 },
      { href: '/student/quests', labelKey: 'nav_quests', icon: Zap, roles: ['student'] },
      { href: '/student/leaderboard', labelKey: 'nav_leaderboard', icon: Trophy, roles: ['student'] },
      { href: '/student/rewards', labelKey: 'nav_rewards', icon: Gift, roles: ['student'] },
      { href: '/student/notifications', labelKey: 'nav_notifications', icon: Bell, roles: ['student'], badge: 0 },
      { href: '/student/badges', labelKey: 'nav_badges', icon: Award, roles: ['student'] },
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

const MISSION_CARD_STORAGE_KEY = 'classroom:mission-card-collapsed-v2'
const SIDEBAR_COLLAPSED_STORAGE_KEY = 'classroom:sidebar-collapsed-v1'

function xpForLevel(level: number) {
  if (level <= 1) return 0
  return 50 * (level - 1) * level
}

function humanizeSegment(segment: string) {
  return segment
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, signOut } = useCurrentUser()
  const { lang, setLang, t } = useLanguage()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [missionCardCollapsed, setMissionCardCollapsed] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const isStudent = user?.role === 'student'
  const isStudentExperience = isStudent || pathname.startsWith('/student')
  const isStudentDashboard = pathname.startsWith('/student/dashboard')
  const isPresentationSurface = pathname.includes('/attendance/') && pathname.endsWith('/flexboard')
  const isLearningSurface = !isPresentationSurface && isStudentExperience
  const isLightSurface = !isPresentationSurface
  const level = user?.level ?? 1
  const xp = user?.xp ?? 0
  const gold = user?.gold_balance ?? 0
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const xpProgress = nextLevelXp > currentLevelXp ? ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100 : 100

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MISSION_CARD_STORAGE_KEY)
      if (saved === '0') setMissionCardCollapsed(false)
      if (saved === '1') setMissionCardCollapsed(true)
      const sidebarSaved = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY)
      if (sidebarSaved === '1') setSidebarCollapsed(true)
      if (sidebarSaved === '0') setSidebarCollapsed(false)
    } catch {
      // The card still works without persisted state when storage is unavailable.
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, next ? '1' : '0')
      } catch {
        // ignore
      }
      return next
    })
  }

  // Build breadcrumb trail from pathname segments, skipping route groups like (app).
  const breadcrumbSegments = pathname
    .split('/')
    .filter((segment) => segment && !segment.startsWith('('))
  const breadcrumbs = breadcrumbSegments.map((segment, index) => {
    const href = '/' + breadcrumbSegments.slice(0, index + 1).join('/')
    const labelKey = `nav_${segment}` as any
    const translated = t(labelKey)
    const label = translated && translated !== labelKey ? translated : humanizeSegment(segment)
    return { href, label }
  })

  const toggleMissionCard = () => {
    setMissionCardCollapsed((collapsed) => {
      const next = !collapsed
      try {
        window.localStorage.setItem(MISSION_CARD_STORAGE_KEY, next ? '1' : '0')
      } catch {
        // Ignore storage failures; the visible toggle should remain responsive.
      }
      return next
    })
  }

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => {
          if (isStudentExperience && (item.href === '/dashboard' || item.href === '/student/dashboard')) return false
          return item.public || (user && item.roles.includes(user.role))
        },
      ),
    }))
    .filter((section) => section.items.length > 0)

  const SidebarContent = ({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) => (
    <>
      <Link
        href={isStudentExperience ? '/student/dashboard' : '/dashboard'}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 border-b border-slate-200 transition-colors hover:bg-slate-50',
          collapsed ? 'justify-center px-3 py-4' : 'px-5 py-4',
        )}
      >
        <div className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
          isStudentExperience ? 'bg-blue-600' : 'bg-slate-900',
        )}>
          {isStudentExperience ? <GraduationCap className="h-6 w-6" /> : <Building2 className="h-5 w-5" />}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="truncate text-base font-extrabold tracking-tight text-slate-950">Classroom MS</h2>
            <p className="text-xs font-medium text-slate-500">{isStudentExperience ? 'Student' : 'Workspace'}</p>
          </div>
        )}
      </Link>

      {!collapsed && (
        <div className="mx-4 my-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          {user ? (
            <div className="flex items-center gap-3">
              {isStudentExperience ? (
                <StudentCharacterAvatar name={user.full_name} compact className="h-10 w-10" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-950">{user.full_name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-xs font-medium capitalize text-slate-500">{t(user.role as any)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <UserCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">Not signed in</p>
            </div>
          )}
        </div>
      )}

      {!collapsed && (
        <div className="mx-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            className="h-9 w-full justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{lang === 'th' ? 'English (EN)' : 'ภาษาไทย (TH)'}</span>
          </Button>
        </div>
      )}

      <nav className={cn('flex-1 overflow-y-auto py-1', collapsed ? 'px-2' : 'px-3')}>
        {visibleSections.map((section) => (
          <div key={section.titleKey} className={collapsed ? 'mb-3' : 'mb-4'}>
            {!collapsed && (
              <h3 className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {t(section.titleKey)}
              </h3>
            )}
            {collapsed && (
              <div className="mx-2 mb-2 h-px bg-slate-200" aria-hidden="true" />
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const itemHref = isStudentExperience && item.href === '/' ? '/student/dashboard' : item.href
                const active = pathname === itemHref || (itemHref !== '/' && pathname.startsWith(`${itemHref}/`))
                const navLabel = t(item.labelKey)
                return (
                  <Link
                    key={item.href}
                    href={itemHref}
                    onClick={onNavigate}
                    title={collapsed ? navLabel : undefined}
                    aria-label={collapsed ? navLabel : undefined}
                    className={cn(
                      'group relative flex min-h-10 items-center rounded-lg text-sm font-bold transition-all duration-200',
                      collapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
                      active
                        ? isStudentExperience
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                          : 'border border-blue-100 bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
                    )}
                  >
                    {active && !isStudentExperience && !collapsed && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-600"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
                      />
                    )}
                    <Icon className={cn('relative z-10 h-4 w-4 shrink-0', active ? 'text-current' : 'text-slate-500 group-hover:text-slate-700')} />
                    {!collapsed && <span className="relative z-10 flex-1 truncate">{navLabel}</span>}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={cn(
                        'relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold',
                        collapsed && 'absolute -right-0.5 -top-0.5 h-4 min-w-4',
                        active && isStudentExperience ? 'bg-white text-blue-600' : 'bg-rose-500 text-white',
                      )}>
                        {item.badge}
                      </span>
                    )}
                    {active && !collapsed && <ChevronRight className={cn('relative z-10 h-3.5 w-3.5', isStudentExperience ? 'text-white/70' : 'text-blue-500')} />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {isStudentExperience && !collapsed && (
        <div className="mx-4 mb-4 shrink-0 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
          <button
            type="button"
            aria-expanded={!missionCardCollapsed}
            aria-label={missionCardCollapsed ? 'เปิดการ์ดภารกิจวันนี้' : 'พับการ์ดภารกิจวันนี้'}
            onClick={toggleMissionCard}
            className="block w-full text-left"
          >
            <div className={cn('bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-600 text-white transition-all', missionCardCollapsed ? 'p-3' : 'p-3.5')}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-amber-100 shadow-inner">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">ภารกิจวันนี้</p>
                    {!missionCardCollapsed && (
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-white/80">ทำให้ครบ รับ XP เพิ่มขึ้น</p>
                    )}
                  </div>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25">
                  <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', missionCardCollapsed && '-rotate-90')} />
                </span>
              </div>
              {missionCardCollapsed && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
                    <div className="h-full w-3/5 rounded-full bg-emerald-300" />
                  </div>
                  <span className="text-[11px] font-black text-white">60%</span>
                </div>
              )}
            </div>
          </button>

          {!missionCardCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="border-t border-blue-100 bg-white p-3"
            >
              <div className="flex items-center justify-between text-xs font-black text-slate-700">
                <span>3 / 5 ภารกิจ</span>
                <span>60%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="progress-shine h-full w-3/5 rounded-full bg-emerald-500" />
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className={cn('border-t border-slate-200', collapsed ? 'p-2' : 'p-3')}>
        {user ? (
          <Button
            variant="ghost"
            title={collapsed ? t('logout') : undefined}
            aria-label={collapsed ? t('logout') : undefined}
            className={cn(
              'w-full rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-950',
              collapsed ? 'justify-center px-0' : 'justify-start gap-3',
            )}
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && t('logout')}
          </Button>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              'w-full rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-950',
              collapsed ? 'justify-center px-0' : 'justify-start gap-3',
            )}
            asChild
          >
            <Link href="/login" onClick={onNavigate} title={collapsed ? t('login') : undefined}>
              <LogOut className="h-4 w-4" />
              {!collapsed && t('login')}
            </Link>
          </Button>
        )}
      </div>
    </>
  )

  const TopBar = () => (
    <header className="sticky top-0 z-30 hidden border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-xl md:block">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={sidebarCollapsed}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 md:inline-flex"
          >
            <PanelLeft className={cn('h-4 w-4 transition-transform duration-200', sidebarCollapsed && 'rotate-180')} />
          </button>
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            isStudentExperience ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-700',
          )}>
            {isStudentExperience ? <Home className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black tracking-tight text-slate-950">
              {isStudentExperience ? 'ศูนย์การเรียนรู้' : 'พื้นที่ทำงาน'}
            </h1>
            {!isStudentExperience && breadcrumbs.length > 0 ? (
              <nav className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
                <Link
                  href={isStudentExperience ? '/student/dashboard' : '/dashboard'}
                  className="rounded-md px-1 py-0.5 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <Home className="h-3.5 w-3.5" />
                </Link>
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1
                  return (
                    <span key={crumb.href} className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3 text-slate-300" aria-hidden="true" />
                      {isLast ? (
                        <span aria-current="page" className="font-semibold text-slate-700">
                          {crumb.label}
                        </span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="rounded-md px-1 py-0.5 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </span>
                  )
                })}
              </nav>
            ) : (
              <p className="mt-0.5 truncate text-sm font-medium text-slate-500">
                {isStudentExperience ? 'เรียนก่อน เล่นเสริม สนุกกับการเรียนรู้ไปด้วยกัน!' : 'จัดการห้องเรียน ห้องประชุม งาน และข้อมูลนักศึกษา'}
              </p>
            )}
          </div>
        </div>

        {isStudentExperience ? (
          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                <div>
                  <p className="text-xs font-extrabold text-slate-500">XP</p>
                  <p className="text-sm font-black text-slate-950">{xp.toLocaleString()} / {nextLevelXp.toLocaleString()}</p>
                  <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                    <div className="progress-shine h-full rounded-full bg-blue-600" style={{ width: `${Math.min(Math.max(xpProgress, 6), 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <Coins className="h-6 w-6 text-amber-500" />
                <div>
                  <p className="text-xs font-extrabold text-slate-500">Gold</p>
                  <p className="text-base font-black text-slate-950">{gold.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 fill-orange-400 text-orange-400" />
                <div>
                  <p className="text-xs font-extrabold text-slate-500">สถิติเรียนต่อเนื่อง</p>
                  <p className="text-base font-black text-slate-950">7 วัน</p>
                </div>
              </div>
            </div>
            <Link href="/student/notifications" className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">6</span>
            </Link>
            <Link href="/profile" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-colors hover:bg-slate-50">
              <StudentCharacterAvatar name={user?.full_name} compact className="h-9 w-9" />
              <div className="text-left">
                <p className="text-sm font-black text-slate-950">{user?.full_name || 'Student'}</p>
                <p className="text-xs font-bold text-slate-500">{user?.grade_level || 'ม.3/2'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <Globe className="mr-1.5 h-4 w-4" />
              {lang === 'th' ? 'EN' : 'TH'}
            </Button>
            <Link href="/profile" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-colors hover:bg-slate-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-950">{user?.full_name || 'User'}</p>
                <p className="text-xs font-medium capitalize text-slate-500">{user?.role ? t(user.role as any) : t('guest')}</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </header>
  )

  return (
    <div className={cn('flex h-screen overflow-hidden', isLightSurface ? (isLearningSurface ? 'bg-[#f4f8ff]' : 'bg-slate-50') : 'bg-[#05070c]')}>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl md:hidden">
        <Link href={isStudentExperience ? '/student/dashboard' : '/dashboard'} className="flex items-center gap-2">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-white', isStudentExperience ? 'bg-blue-600' : 'bg-slate-900')}>
            {isStudentExperience ? <GraduationCap className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
          </div>
          <span className="text-sm font-black text-slate-950">Classroom MS</span>
        </Link>
        <button
          type="button"
          aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMobileNavOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
        >
          {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 md:flex',
          sidebarCollapsed ? 'w-16' : 'w-64',
        )}
        aria-label="Sidebar navigation"
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[86vw] flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:hidden ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
      </aside>

      <main className={cn(
        'flex-1 overflow-y-auto pt-14 md:pt-0',
        isLightSurface
          ? isLearningSurface ? 'bg-[#f4f8ff]' : 'bg-slate-50'
          : 'bg-gradient-to-br from-[#05070c] via-[#090b12] to-[#05070c]',
      )}>
        <TopBar />
        <div className={cn(
          'mx-auto',
          isLightSurface && 'legacy-light-surface',
          isStudentDashboard ? 'max-w-[1440px] p-4 sm:p-5 lg:p-6' : 'max-w-7xl p-4 sm:p-6 lg:p-8',
        )}>
          {children}
        </div>
      </main>

      {user?.role === 'student' && <AIChatWidget />}
    </div>
  )
}
