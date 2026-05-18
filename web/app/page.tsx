'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, Building2, GraduationCap, ArrowRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomeDashboard() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-violet-600/5 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">RoomBooking</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/login')}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <LogIn className="mr-2 h-4 w-4" />
            เข้าสู่ระบบ
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl font-bold text-white sm:text-5xl">
            ระบบจองห้อง
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-slate-400">
            เลือกประเภทห้องที่ต้องการจอง ห้องประชุมจองได้ทันทีโดยไม่ต้องเข้าสู่ระบบ
            ห้องเรียนต้องเข้าสู่ระบบก่อน
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid w-full gap-6 sm:grid-cols-2"
        >
          {/* Meeting Rooms */}
          <button
            onClick={() => router.push('/meeting-rooms')}
            className="group relative flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center transition-all hover:border-blue-500/30 hover:bg-blue-500/5"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-white">ห้องประชุม</h2>
            <p className="mt-2 text-sm text-slate-400">
              จองห้องประชุมได้ทันทีโดยไม่ต้องเข้าสู่ระบบ
            </p>
            <div className="mt-5 flex items-center gap-1 text-sm font-medium text-blue-400 transition-colors group-hover:text-blue-300">
              จองเลย
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Classrooms */}
          <button
            onClick={() => router.push('/login')}
            className="group relative flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-110">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-white">ห้องเรียน</h2>
            <p className="mt-2 text-sm text-slate-400">
              ต้องเข้าสู่ระบบก่อนจึงจะสามารถจองห้องเรียนได้
            </p>
            <div className="mt-5 flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors group-hover:text-emerald-300">
              เข้าสู่ระบบ
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-slate-600">
          <p>ระบบจองห้องประชุมและห้องเรียน · สำหรับบุคลากรและนักศึกษา</p>
        </div>
      </main>
    </div>
  )
}

