'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, Building2, GraduationCap, ArrowRight, Users, Globe, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language-context'

export default function HomeDashboard() {
  const router = useRouter()
  const { lang, setLang, t } = useLanguage()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070c] bg-grid-lines">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <Building2 className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">RoomBooking</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Language Switcher Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 px-3 rounded-lg"
            >
              <Globe className="mr-1.5 h-3.5 w-3.5" />
              <span>{lang === 'th' ? 'EN' : 'TH'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/login')}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <LogIn className="mr-2 h-4 w-4" />
              {t('login')}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-3.5 py-1 text-xs font-medium text-blue-400 mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Classroom & Meeting Room Management</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-6xl max-w-2xl mx-auto leading-tight">
            <span className="shiny-text">{t('landing_title')}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-slate-400 text-base leading-relaxed">
            {t('landing_subtitle')}
          </p>
        </motion.div>

        {/* Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid w-full gap-8 sm:grid-cols-2"
        >
          {/* Meeting Rooms Card (Public) */}
          <div className="border-beam-container group relative">
            {/* The Border Beam Effect (shows on hover) */}
            <div className="absolute inset-0 border-beam opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <button
              onClick={() => router.push('/meeting-rooms')}
              className="relative w-full flex flex-col items-center rounded-2xl border border-white/5 bg-slate-900/40 p-8 text-center transition-all duration-300 hover:bg-slate-900/60 backdrop-blur-sm"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500/80 shadow-lg shadow-blue-500/10 transition-transform duration-300 group-hover:scale-105">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-6 text-xl font-bold text-white tracking-tight">{t('meeting_rooms')}</h2>
              <p className="mt-2.5 text-sm text-slate-400 leading-relaxed max-w-xs">
                {t('meeting_rooms_desc')}
              </p>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-blue-400 transition-colors group-hover:text-blue-300">
                {t('book_now')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>

          {/* Classrooms Card (Requires Login) */}
          <div className="border-beam-container group relative">
            {/* The Border Beam Effect (shows on hover) */}
            <div className="absolute inset-0 border-beam opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <button
              onClick={() => router.push('/login')}
              className="relative w-full flex flex-col items-center rounded-2xl border border-white/5 bg-slate-900/40 p-8 text-center transition-all duration-300 hover:bg-slate-900/60 backdrop-blur-sm"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500/80 shadow-lg shadow-indigo-500/10 transition-transform duration-300 group-hover:scale-105">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-6 text-xl font-bold text-white tracking-tight">{t('classrooms')}</h2>
              <p className="mt-2.5 text-sm text-slate-400 leading-relaxed max-w-xs">
                {t('classrooms_desc')}
              </p>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-indigo-400 transition-colors group-hover:text-indigo-300">
                {t('sign_in_now')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-20 text-center text-xs text-slate-500">
          <p>{t('footer_text')}</p>
        </div>
      </main>
    </div>
  )
}

