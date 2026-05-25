'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, Globe, GraduationCap, LogIn, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language-context'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function HomeDashboard() {
  const router = useRouter()
  const { lang, setLang, t } = useLanguage()
  const { role } = useCurrentUser()
  const dashboardTarget = role === 'student' ? '/student/dashboard' : '/dashboard'
  const classroomTarget = role ? '/classrooms' : '/login?next=/classrooms'
  const classroomCta = role ? t('nav_classrooms') : t('sign_in_now')
  const authTarget = role ? dashboardTarget : '/login'
  const authCta = role
    ? role === 'student'
      ? t('nav_my_dashboard')
      : t('nav_dashboard')
    : t('login')

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/70 text-slate-950">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-950">Classroom MS</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="gap-1.5 rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Globe className="h-4 w-4" />
              <span>{lang === 'th' ? 'EN' : 'TH'}</span>
            </Button>

            <Button
              variant="brand"
              size="sm"
              onClick={() => router.push(authTarget)}
              className="gap-1.5 rounded-xl"
            >
              <LogIn className="h-4 w-4" />
              {authCta}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col px-5 py-12 lg:py-16">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex flex-col"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-xs font-black text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Classroom & Meeting Room Management
          </div>

          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
            Classroom MS
          </h1>

          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600">
            {t('landing_subtitle')}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => router.push(classroomTarget)}
              className="group rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-lg font-black text-slate-950">{t('classrooms')}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{t('classrooms_desc')}</p>
              <div className="mt-5 flex items-center gap-1 text-sm font-black text-blue-600">
                {classroomCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            <button
              onClick={() => router.push('/meeting-rooms')}
              className="group rounded-2xl border border-emerald-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/70"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-200">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-lg font-black text-slate-950">{t('meeting_rooms')}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{t('meeting_rooms_desc')}</p>
              <div className="mt-5 flex items-center gap-1 text-sm font-black text-emerald-600">
                {t('book_now')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </motion.section>
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-8 text-xs font-semibold text-slate-400">
        {t('footer_text')}
      </footer>
    </div>
  )
}
