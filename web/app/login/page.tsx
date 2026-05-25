'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DoorOpen, AlertCircle, Globe, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { apiFetch } from '@/lib/http/client'
import { setAccessToken, setStoredUser } from '@/lib/auth/session'
import { useLanguage } from '@/lib/context/language-context'

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[100px] opacity-25 ${className}`}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { lang, setLang, t } = useLanguage()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch<{ data: { access_token: string; user: { id: string; email: string; full_name: string; role: string; xp?: number; level?: number; gold_balance?: number; rank_title?: string; grade_level?: string } } }>(
        '/api/v1/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      )
      setAccessToken(res.data.access_token)
      setStoredUser({
        id: res.data.user.id,
        email: res.data.user.email,
        full_name: res.data.user.full_name,
        role: res.data.user.role as 'admin' | 'teacher' | 'student' | 'guest',
        xp: res.data.user.xp,
        level: res.data.user.level,
        gold_balance: res.data.user.gold_balance,
        rank_title: res.data.user.rank_title,
        grade_level: res.data.user.grade_level,
      })
      document.cookie = `access_token=${res.data.access_token}; path=/; max-age=86400`
      router.push(res.data.user.role === 'student' ? '/student/dashboard' : '/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070c] p-4 bg-grid-lines">
      {/* Background orbs */}
      <FloatingOrb className="top-10 left-1/4 h-80 w-80 bg-blue-500/10" delay={0} />
      <FloatingOrb className="bottom-10 right-1/4 h-96 w-96 bg-indigo-500/10" delay={2.5} />
      <FloatingOrb className="top-1/3 left-12 h-64 w-64 bg-violet-500/5" delay={5} />

      {/* Floating Back to Home button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 gap-1.5 rounded-lg">
            <ArrowLeft className="h-4 w-4" />
            <span>{t('home')}</span>
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-panel rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative">

          {/* Internal Language Switcher Icon Button */}
          <div className="absolute top-5 right-5">
            <button
              type="button"
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/5 px-2.5 py-1 rounded-md"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{lang === 'th' ? 'EN' : 'TH'}</span>
            </button>
          </div>

          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/10">
              <DoorOpen className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-xl font-bold text-white tracking-tight">
              {t('login_title')}
            </h1>
            <p className="mt-2 text-xs text-slate-400 max-w-xs">
              {t('login_subtitle')}
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@school.edu"
                leftIcon={<Mail className="h-4 w-4" />}
                className="glass-input border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-blue-400/40 focus-visible:ring-offset-0 text-sm h-10 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-300">
                {t('password')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder={lang === 'th' ? 'ป้อนรหัสผ่านของคุณ' : 'Enter your password'}
                  leftIcon={<Lock className="h-4 w-4" />}
                  className="glass-input border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-blue-400/40 focus-visible:ring-offset-0 text-sm h-10 rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('hide_password') : t('show_password')}
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                role="alert"
                className="flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <p className="text-xs text-red-300">{t('login_failed')}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="brand"
              loading={loading}
              loadingText={t('signin_loading')}
              className="w-full h-10 rounded-lg text-sm font-semibold"
            >
              {t('login')}
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-slate-950/80 px-3 text-slate-500 capitalize">{t('or')}</span>
              </div>
            </div>

            <Link href="/register" className="block w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-all duration-300 h-10 rounded-lg text-sm font-semibold"
              >
                {t('register')}
              </Button>
            </Link>
          </motion.form>

          <motion.p
            className="mt-5 text-center text-[10px] text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t('secure_login')}
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
