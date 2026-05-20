'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listRecords, getSession, AttendanceRecord } from '@/lib/api/attendance'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Users, Clock, Award, ShieldAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Layered Character rendering (Redefined for self-containment)
interface SpriteProps {
  hair?: string
  hat?: string
  outfit?: string
  aura?: string
}

function CharacterSprite({ hair = 'hair_novice', hat = 'hat_none', outfit = 'outfit_novice', aura = 'aura_none' }: SpriteProps) {
  return (
    <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950/80 border border-white/5 w-28 h-32">
      {/* Aura Layer (Backmost) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {aura === 'aura_glow' && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-cyan-500/20 blur-lg"
          />
        )}
        {aura === 'aura_fire' && (
          <motion.div
            animate={{ y: [0, -4, 0], scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full bg-gradient-to-t from-orange-500/35 via-red-500/10 to-transparent blur-md"
          />
        )}
        {aura === 'aura_rainbow' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-22 h-22 rounded-full bg-gradient-to-r from-pink-500/10 via-amber-500/10 to-violet-500/10 blur-sm border border-dashed border-violet-500/20"
          />
        )}
      </div>

      {/* SVG Canvas */}
      <svg viewBox="0 0 100 100" className="w-5/6 h-5/6 z-10 select-none">
        <defs>
          <linearGradient id="hair-novice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#854d0e" /><stop offset="100%" stopColor="#451a03" /></linearGradient>
          <linearGradient id="hair-spiky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#1e3a8a" /></linearGradient>
          <linearGradient id="hair-elegant" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#6b21a8" /></linearGradient>
          <linearGradient id="hair-flaming" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" /><stop offset="50%" stopColor="#ef4444" /><stop offset="100%" stopColor="#b91c1c" /></linearGradient>

          <linearGradient id="outfit-novice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a1a1aa" /><stop offset="100%" stopColor="#52525b" /></linearGradient>
          <linearGradient id="outfit-apprentice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#047857" /></linearGradient>
          <linearGradient id="outfit-wizard" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#4c1d95" /></linearGradient>
          <linearGradient id="outfit-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#64748b" /></linearGradient>
          <linearGradient id="outfit-god" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" /></linearGradient>
        </defs>

        <rect x="35" y="32" width="30" height="26" rx="8" fill="#fed7aa" />
        <rect x="46" y="55" width="8" height="8" fill="#fdba74" />
        <circle cx="43" cy="44" r="2" fill="#1e293b" />
        <circle cx="57" cy="44" r="2" fill="#1e293b" />
        <path d="M 46 49 Q 50 53 54 49" stroke="#9a3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="40" cy="47" r="1.5" fill="#fca5a5" opacity="0.6" />
        <circle cx="60" cy="47" r="1.5" fill="#fca5a5" opacity="0.6" />

        {hair === 'hair_novice' && <path d="M 32 34 C 32 20, 68 20, 68 34 C 68 34, 70 30, 64 26 Z" fill="url(#hair-novice)" />}
        {hair === 'hair_spiky' && <path d="M 31 35 L 26 26 L 36 28 L 42 16 L 50 24 L 58 16 L 64 28 L 74 26 L 69 35 Z" fill="url(#hair-spiky)" />}
        {hair === 'hair_elegant' && (
          <g>
            <path d="M 33 34 C 33 22, 67 22, 67 34 Z" fill="url(#hair-elegant)" />
            <path d="M 34 35 Q 26 40 28 52" stroke="url(#hair-elegant)" strokeWidth="4" fill="none" />
            <path d="M 66 35 Q 74 40 72 52" stroke="url(#hair-elegant)" strokeWidth="4" fill="none" />
          </g>
        )}
        {hair === 'hair_flaming' && <path d="M 32 35 C 28 25, 40 18, 52 14 C 64 18, 68 36, 68 36 Z" fill="url(#hair-flaming)" />}

        {outfit === 'outfit_novice' && <path d="M 32 60 L 68 60 L 65 85 L 35 85 Z" fill="url(#outfit-novice)" />}
        {outfit === 'outfit_apprentice' && <path d="M 30 60 L 70 60 L 65 85 L 35 85 Z" fill="url(#outfit-apprentice)" />}
        {outfit === 'outfit_wizard' && <path d="M 28 60 L 72 60 L 66 85 L 34 85 Z" fill="url(#outfit-wizard)" />}
        {outfit === 'outfit_plate' && (
          <g>
            <path d="M 30 60 L 70 60 L 65 85 L 35 85 Z" fill="url(#outfit-plate)" />
            <path d="M 26 60 Q 30 54 36 60 Z" fill="#94a3b8" />
            <path d="M 74 60 Q 70 54 64 60 Z" fill="#94a3b8" />
          </g>
        )}
        {outfit === 'outfit_god' && (
          <g>
            <path d="M 30 65 Q 14 55 18 42 Z" fill="#fbbf24" opacity="0.8" />
            <path d="M 70 65 Q 86 55 82 42 Z" fill="#fbbf24" opacity="0.8" />
            <path d="M 28 60 L 72 60 L 66 85 L 34 85 Z" fill="url(#outfit-god)" />
          </g>
        )}

        {hat === 'hat_bandana' && <path d="M 32 32 H 68 V 37 H 32 Z" fill="#ef4444" />}
        {hat === 'hat_wizard' && <path d="M 22 32 C 22 28, 78 28, 78 32 C 78 32, 50 4, 22 32 Z" fill="#312e81" />}
        {hat === 'hat_crown' && <path d="M 34 32 L 31 20 L 50 16 L 69 20 L 66 32 Z" fill="#facc15" />}
        {hat === 'hat_conqueror' && <path d="M 30 32 C 30 18, 70 18, 70 32 Z" fill="#1e293b" />}
      </svg>

      {aura === 'aura_rainbow' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-6 w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute bottom-8 right-6 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-bounce" />
        </div>
      )}
    </div>
  )
}

export default function LiveAttendanceFlexboard() {
  const { id } = useParams() as { id: string }
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [prevPresentCount, setPrevPresentCount] = useState<number>(0)

  // Real-time polling every 2.5 seconds
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

  // Filter checked in students (present or late)
  const checkedInStudents = records?.filter(r => r.status === 'present' || r.status === 'late') || []
  const presentCount = checkedInStudents.length
  const totalCount = records?.length || 0

  // Trigger real-time check-in notifications
  useEffect(() => {
    if (records && records.length > 0 && presentCount > prevPresentCount) {
      // Find the student who just checked in
      const newlyCheckedIn = checkedInStudents.find(
        student => !records.some(r => r.student_id === student.student_id && (r.status === 'absent' || r.status === 'leave'))
      )
      if (newlyCheckedIn) {
        setToastMessage(`🎉 น้อง ${newlyCheckedIn.student_name || 'เพื่อนร่วมห้อง'} ลงชื่อเข้าเรียนพร้อมตัวละครสุดเฟี้ยวแล้ว!`)
        const timer = setTimeout(() => setToastMessage(null), 4000)
        return () => clearTimeout(timer)
      }
    }
    setPrevPresentCount(presentCount)
  }, [presentCount, records])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto bg-white/5" />
          <Skeleton className="h-64 w-80 mx-auto bg-white/5 rounded-2xl" />
          <p className="text-slate-400 animate-pulse">กำลังโหลดกระดานสดตัวละคร...</p>
        </div>
      </div>
    )
  }

  // Define premium background glowing gradients based on Title rarity
  const getCardStyleByTitle = (title?: string) => {
    if (!title) return 'border-white/10 bg-slate-900/40'
    if (title.includes('Expert') || title.includes('Conqueror') || title.includes('ผู้พิชิต')) {
      // Legendary/Exclusive Glow
      return 'border-amber-500 bg-amber-950/15 shadow-lg shadow-amber-500/10'
    }
    if (title.includes('Streak') || title.includes('5 วัน')) {
      // Epic Glow
      return 'border-purple-500 bg-purple-950/15 shadow-lg shadow-purple-500/10'
    }
    // Rare Glow
    return 'border-cyan-500 bg-cyan-950/15 shadow-lg shadow-cyan-500/10'
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white relative overflow-hidden flex flex-col p-6 sm:p-10 font-sans">
      {/* Animated background stars/grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header Grid */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-500 w-2.5 h-2.5 rounded-full animate-ping" />
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              LIVE CHARACTER FLEXBOARD
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            ส่องตัวละคร 2D Retro และฉายาระดับตำนานของเหล่านักรบเรียนรู้ที่เช็คชื่อแล้ววันนี้!
          </p>
        </div>

        {/* Counter Widget */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-white/15 px-6 py-3 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            <span className="text-xs text-slate-400 font-bold uppercase">เช็คชื่อแล้ว (Checked In)</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {presentCount} <span className="text-slate-500 text-lg">/ {totalCount}</span>
          </div>
        </div>
      </div>

      {/* Grid of Characters */}
      <div className="flex-1 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 items-start content-start">
        <AnimatePresence>
          {checkedInStudents.map((row) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.7, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 30 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              key={row.id}
              className={`flex flex-col items-center justify-between border rounded-2xl p-4 backdrop-blur-md transition-all ${getCardStyleByTitle(row.student_title)}`}
            >
              {/* Layered Sprite Preview */}
              <CharacterSprite
                hair={row.equipped_hair}
                hat={row.equipped_hat}
                outfit={row.equipped_outfit}
                aura={row.equipped_aura}
              />

              {/* Student Name */}
              <h3 className="mt-3 text-sm font-extrabold text-white text-center line-clamp-1">{row.student_name}</h3>

              {/* Equiped Title Badge */}
              <div className="mt-2 w-full text-center">
                {row.student_title ? (
                  <span className="inline-block w-full px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase border border-amber-500/20 bg-amber-500/10 text-amber-300 truncate shadow-sm">
                    🏆 {row.student_title}
                  </span>
                ) : (
                  <span className="inline-block w-full px-2 py-0.5 rounded-lg text-[9px] font-semibold bg-slate-950/60 text-slate-500">
                    นักเดินทางฝึกฝน
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {checkedInStudents.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500">
          <Clock className="h-16 w-16 text-slate-700 animate-spin mb-4" />
          <h2 className="text-lg font-bold text-slate-400">ยังไม่มีผู้ลงชื่อเข้าเรียนเข้าเรียนเข้าสู่ระบบ</h2>
          <p className="text-xs text-slate-600 mt-1">รอให้นักเรียนทำการเช็คอินผ่านรหัสคิวอาร์หรือการเช็คชื่อเข้าคลาสเรียน...</p>
        </div>
      )}

      {/* Toast Notification for Real-Time check-ins */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-violet-500/40 px-6 py-4 rounded-2xl shadow-2xl shadow-violet-500/10 backdrop-blur-lg flex items-center gap-3 z-50 max-w-md"
          >
            <Sparkles className="h-5 w-5 text-yellow-400 animate-bounce flex-shrink-0" />
            <p className="text-xs font-bold text-white leading-relaxed">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
