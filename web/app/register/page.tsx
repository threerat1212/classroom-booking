'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DoorOpen, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { apiFetch, isApiError } from '@/lib/http/client'
import { setAccessToken, setStoredUser } from '@/lib/auth/session'

const REGISTER_ROLES = ['student', 'teacher', 'guest'] as const
type RegisterRole = (typeof REGISTER_ROLES)[number]

function isRegisterRole(value: string): value is RegisterRole {
  return REGISTER_ROLES.includes(value as RegisterRole)
}

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-40 ${className}`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<RegisterRole>('student')
  const [teacherInviteCode, setTeacherInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!isRegisterRole(role)) {
      setError('Please choose a valid role')
      return
    }

    if (role === 'teacher' && teacherInviteCode.trim() === '') {
      setError('Teacher invite code is required')
      return
    }

    setLoading(true)
    try {
      const res = await apiFetch<{ data: { access_token: string; user: { id: string; email: string; full_name: string; role: string; xp?: number; level?: number; gold_balance?: number; rank_title?: string } } }>(
        '/api/v1/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            role,
            teacher_invite_code: role === 'teacher' ? teacherInviteCode : undefined,
          }),
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
      })
      document.cookie = `access_token=${res.data.access_token}; path=/; max-age=86400`
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 800)
    } catch (err) {
      if (isApiError(err) && err.code === 'VALIDATION_ERROR' && err.message.includes('RegisterRequest.Role')) {
        setError('Please choose a valid role')
      } else if (isApiError(err) && err.code === 'EMAIL_EXISTS') {
        setError('This email is already registered')
      } else if (isApiError(err) && err.code === 'TEACHER_INVITE_REQUIRED') {
        setError('Teacher invite code is required')
      } else if (isApiError(err) && err.code === 'INVALID_TEACHER_INVITE') {
        setError('Teacher invite code is invalid')
      } else if (isApiError(err) && err.code === 'TEACHER_INVITE_NOT_CONFIGURED') {
        setError('Teacher signup is not configured yet')
      } else {
        setError(err instanceof Error ? err.message : 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950" />
      <FloatingOrb className="top-20 left-1/4 h-72 w-72 bg-blue-600" delay={0} />
      <FloatingOrb className="bottom-20 right-1/4 h-96 w-96 bg-indigo-600" delay={2} />
      <FloatingOrb className="top-1/2 left-10 h-48 w-48 bg-purple-600" delay={4} />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <DoorOpen className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-white tracking-tight">
              Create Account
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Join to manage rooms, bookings, and assignments
            </p>
          </motion.div>

          {success ? (
            <motion.div
              className="mt-8 flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle className="h-12 w-12 text-green-400" />
              <p className="text-lg font-medium text-white">Account created!</p>
              <p className="text-sm text-slate-400">Redirecting to dashboard...</p>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-300">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="John Doe"
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@school.edu"
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-slate-300">
                  Role
                </Label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    if (isRegisterRole(value)) {
                      setRole(value)
                      if (value !== 'teacher') {
                        setTeacherInviteCode('')
                      }
                    }
                  }}
                  required
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-blue-500 focus:ring-offset-0 [&>span]:text-white [&>svg]:text-slate-400">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'teacher' && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Label htmlFor="teacherInviteCode" className="text-sm font-medium text-slate-300">
                    Teacher Invite Code
                  </Label>
                  <Input
                    id="teacherInviteCode"
                    type="password"
                    value={teacherInviteCode}
                    onChange={(e) => setTeacherInviteCode(e.target.value)}
                    required
                    autoComplete="off"
                    placeholder="Enter invite code"
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:bg-white/10 transition-colors"
                  />
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:bg-white/10 transition-colors"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </motion.form>
          )}

          <motion.p
            className="mt-6 text-center text-sm text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
