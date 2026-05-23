'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, CheckCircle, Clock, Sparkles, Users } from 'lucide-react'
import { getSession, listRecords } from '@/lib/api/attendance'
import { Skeleton } from '@/components/ui/skeleton'

function titleCardStyle(title?: string) {
  if (!title) return 'border-white/10 bg-slate-900/50'
  if (title.includes('Expert') || title.includes('Conqueror') || title.includes('ผู้พิชิต')) {
    return 'border-amber-500/40 bg-amber-500/10 shadow-lg shadow-amber-500/10'
  }
  if (title.includes('Streak') || title.includes('5 วัน')) {
    return 'border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/10'
  }
  return 'border-cyan-500/35 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
}

export default function LiveAttendanceBoard() {
  const { id } = useParams() as { id: string }
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [prevPresentCount, setPrevPresentCount] = useState(0)

  const { data: session } = useQuery({
    queryKey: ['attendance-session-live', id],
    queryFn: async () => {
      const res = await getSession(id)
      return res.data
    },
    refetchInterval: 3000,
  })

  const { data: records, isLoading } = useQuery({
    queryKey: ['attendance-records-live', id],
    queryFn: async () => {
      const res = await listRecords(id)
      return res.data
    },
    refetchInterval: 2500,
  })

  const checkedInStudents = records?.filter((record) => record.status === 'present' || record.status === 'late') || []
  const presentCount = checkedInStudents.length
  const totalCount = records?.length || 0

  useEffect(() => {
    if (records && records.length > 0 && presentCount > prevPresentCount) {
      const latest = checkedInStudents[0]
      if (latest) {
        setToastMessage(`${latest.student_name || 'นักเรียน'} เช็กชื่อเข้าเรียนแล้ว`)
        const timer = setTimeout(() => setToastMessage(null), 3500)
        return () => clearTimeout(timer)
      }
    }
    setPrevPresentCount(presentCount)
  }, [presentCount, records, checkedInStudents, prevPresentCount])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-8 w-48 bg-white/5" />
          <Skeleton className="mx-auto h-64 w-80 rounded-2xl bg-white/5" />
          <p className="animate-pulse text-slate-400">กำลังโหลดกระดานเช็กชื่อสด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-slate-950 p-6 font-sans text-white sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
            <h1 className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 bg-clip-text text-3xl font-black tracking-tight text-transparent">
              LIVE ATTENDANCE BOARD
            </h1>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-400">
            กระดานสดสำหรับดูผู้เข้าเรียน ฉายา และสถานะการเช็กชื่อของคลาส {session?.status ? `(${session.status})` : ''}
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-slate-900/60 px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-300" />
            <span className="text-xs font-bold uppercase text-slate-400">Checked In</span>
          </div>
          <div className="font-mono text-2xl font-black text-white">
            {presentCount} <span className="text-lg text-slate-500">/ {totalCount}</span>
          </div>
        </div>
      </div>

      <div className="relative grid flex-1 auto-rows-fr grid-cols-2 content-start gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <AnimatePresence>
          {checkedInStudents.map((row) => (
            <motion.div
              key={row.id}
              layout
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-md ${titleCardStyle(row.student_title)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 text-xl font-black text-white">
                  {(row.student_name || '?').charAt(0).toUpperCase()}
                </div>
                {row.status === 'present' ? (
                  <CheckCircle className="h-6 w-6 text-emerald-300" />
                ) : (
                  <Clock className="h-6 w-6 text-amber-300" />
                )}
              </div>

              <div className="mt-6">
                <h3 className="line-clamp-1 text-lg font-black text-white">{row.student_name || 'ไม่ทราบชื่อ'}</h3>
                <div className="mt-2">
                  {row.student_title ? (
                    <span className="inline-flex max-w-full items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                      <Award className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{row.student_title}</span>
                    </span>
                  ) : (
                    <span className="inline-block rounded-lg bg-slate-950/60 px-2 py-1 text-[10px] font-semibold text-slate-500">
                      Learning Rookie
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  {row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString('th-TH') : 'ยังไม่ระบุเวลา'}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {checkedInStudents.length === 0 && (
        <div className="relative flex flex-1 flex-col items-center justify-center p-12 text-slate-500">
          <Clock className="mb-4 h-16 w-16 animate-spin text-slate-700" />
          <h2 className="text-lg font-bold text-slate-400">ยังไม่มีผู้เช็กชื่อเข้าเรียน</h2>
          <p className="mt-1 text-xs text-slate-600">รอให้นักเรียนเช็กชื่อผ่าน QR หรือให้ครูบันทึกสถานะ...</p>
        </div>
      )}

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-8 left-1/2 z-50 flex max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900 px-6 py-4 shadow-2xl shadow-emerald-500/10 backdrop-blur-lg"
          >
            <Sparkles className="h-5 w-5 shrink-0 animate-bounce text-emerald-300" />
            <p className="text-xs font-bold leading-relaxed text-white">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
