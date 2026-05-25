'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, ArrowLeft, DoorOpen, Eye, EyeOff, Globe, GraduationCap, Lock, Mail } from 'lucide-react'
import { apiFetch } from '@/lib/http/client'
import { setAccessToken, setStoredUser } from '@/lib/auth/session'
import { useLanguage } from '@/lib/context/language-context'

const fieldClass = 'h-11 rounded-xl border-slate-200 bg-white text-slate-950 shadow-sm placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:ring-offset-1'

function safeNextPath() {
  if (typeof window === 'undefined') return ''

  const next = new URLSearchParams(window.location.search).get('next')
  if (!next || !next.startsWith('/') || next.startsWith('//')) return ''

  return next
}

function loginDestination(role: string) {
  return safeNextPath() || (role === 'student' ? '/student/dashboard' : '/dashboard')
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
      document.cookie = `user_role=${res.data.user.role}; path=/; max-age=86400`
      router.push(loginDestination(res.data.user.role))
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/70 px-4 py-5 text-slate-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl px-1 py-1 text-sm font-black text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
            <DoorOpen className="h-5 w-5" />
          </span>
          Classroom MS
        </Link>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            className="gap-1.5 rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Globe className="h-4 w-4" />
            {lang === 'th' ? 'EN' : 'TH'}
          </Button>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 rounded-xl text-slate-600 hover:bg-white hover:text-slate-950">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              {t('home')}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-92px)] max-w-6xl items-center justify-center py-8">
        <motion.section
          initial={{ opacity: 0, y: 14, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                {t('login')}
              </h1>
              <p className="mt-2 max-w-xs text-sm font-medium leading-6 text-slate-500">
                {lang === 'th'
                  ? 'ใช้บัญชีเดียว ระบบจะเปิดพื้นที่ทำงานตามบทบาทของอีเมล'
                  : 'Use one account. The app opens the workspace for that email role.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black text-slate-700">
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
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black text-slate-700">
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
                    className={`${fieldClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t('hide_password') : t('show_password')}
                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
                  className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-xs font-semibold text-red-700">{t('login_failed')}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                variant="brand"
                loading={loading}
                loadingText={t('signin_loading')}
                className="h-11 w-full rounded-xl text-sm font-black"
              >
                {t('login')}
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-3 font-bold text-slate-400 capitalize">{t('or')}</span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="h-11 w-full rounded-xl border-slate-200 bg-white text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-950"
              >
                <Link href="/register">{t('register')}</Link>
              </Button>
            </form>

          </div>
        </motion.section>
      </main>
    </div>
  )
}
