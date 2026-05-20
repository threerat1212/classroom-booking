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
          <linearGradient id="hair-novice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d97706" /><stop offset="100%" stopColor="#78350f" /></linearGradient>
          <linearGradient id="hair-spiky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" /></linearGradient>
          <linearGradient id="hair-elegant" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#7e22ce" /></linearGradient>
          <linearGradient id="hair-flaming" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" /><stop offset="50%" stopColor="#ef4444" /><stop offset="100%" stopColor="#b91c1c" /></linearGradient>
          <linearGradient id="hair-silver_wave" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f8fafc" /><stop offset="100%" stopColor="#94a3b8" /></linearGradient>

          <linearGradient id="outfit-novice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a1a1aa" /><stop offset="100%" stopColor="#52525b" /></linearGradient>
          <linearGradient id="outfit-apprentice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#047857" /></linearGradient>
          <linearGradient id="outfit-wizard" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#4c1d95" /></linearGradient>
          <linearGradient id="outfit-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#64748b" /></linearGradient>
          <linearGradient id="outfit-god" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" /></linearGradient>

          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde0c0" />
            <stop offset="100%" stopColor="#f4a87a" />
          </linearGradient>
        </defs>

        {/* Neck */}
        <rect x="46" y="58" width="8" height="6" fill="#fde0c0" />

        {/* Body Torso */}
        <path d="M 38 64 L 62 64 C 64 74, 63 86, 50 86 C 37 86, 36 74, 38 64 Z" fill={`url(#${outfit.replace('_', '-')})`} />
        {/* Uniform collar */}
        <path d="M 44 64 L 50 70 L 56 64" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />

        {/* Arms */}
        <path d="M 38 64 C 33 65, 31 72, 32 75 C 33 76, 35 75, 36 73 Z" fill={`url(#${outfit.replace('_', '-')})`} />
        <circle cx="33.5" cy="75.5" r="1.8" fill="#fde0c0" />
        <path d="M 62 64 C 67 65, 69 72, 68 75 C 67 76, 65 75, 64 73 Z" fill={`url(#${outfit.replace('_', '-')})`} />
        <circle cx="66.5" cy="75.5" r="1.8" fill="#fde0c0" />

        {/* Head */}
        <path d="M 34 42 C 34 32, 66 32, 66 42 C 66 52, 62 60, 50 60 C 38 60, 34 52, 34 42 Z" fill="url(#skinGrad)" stroke="#c2410c" strokeWidth="0.4" />

        {/* Big anime eyes */}
        {/* Left eye */}
        <ellipse cx="42" cy="46" rx="3.2" ry="4" fill="#ffffff" />
        <ellipse cx="42" cy="46" rx="2" ry="3.5" fill={`url(#${hair.replace('_', '-')})`} />
        <ellipse cx="42" cy="46.5" rx="1.1" ry="1.8" fill="#1e293b" />
        <circle cx="41.2" cy="44.2" r="0.8" fill="#ffffff" />
        <path d="M 38 44 Q 42 41 46 44" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
        {/* Right eye */}
        <ellipse cx="58" cy="46" rx="3.2" ry="4" fill="#ffffff" />
        <ellipse cx="58" cy="46" rx="2" ry="3.5" fill={`url(#${hair.replace('_', '-')})`} />
        <ellipse cx="58" cy="46.5" rx="1.1" ry="1.8" fill="#1e293b" />
        <circle cx="57.2" cy="44.2" r="0.8" fill="#ffffff" />
        <path d="M 54 44 Q 58 41 62 44" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />

        {/* Blush */}
        <ellipse cx="39" cy="51" rx="2.5" ry="1" fill="#fca5a5" opacity="0.6" />
        <ellipse cx="61" cy="51" rx="2.5" ry="1" fill="#fca5a5" opacity="0.6" />

        {/* Cute Smile */}
        <path d="M 48.5 52.5 Q 50 54.2 51.5 52.5" fill="none" stroke="#c2410c" strokeWidth="0.8" strokeLinecap="round" />

        {/* Back hair side locks (under overlay) */}
        {hair === 'hair_novice' && (
          <g>
            <path d="M 32 40 C 30 46, 32 54, 34 54 C 36 54, 35 46, 35 40 Z" fill="url(#hair-novice)" />
            <path d="M 68 40 C 70 46, 68 54, 66 54 C 64 54, 65 46, 65 40 Z" fill="url(#hair-novice)" />
          </g>
        )}
        {hair === 'hair_elegant' && (
          <g>
            <path d="M 33 40 C 23 46, 25 66, 29 70 C 31 66, 30 46, 30 40 Z" fill="url(#hair-elegant)" />
            <path d="M 67 40 C 77 46, 75 66, 71 70 C 69 66, 70 46, 70 40 Z" fill="url(#hair-elegant)" />
          </g>
        )}

        {/* Hair Front Bangs */}
        {hair === 'hair_novice' && <path d="M 32 40 C 32 20, 68 20, 68 40 C 62 44, 56 40, 50 44 C 44 40, 38 44, 32 40 Z" fill="url(#hair-novice)" />}
        {hair === 'hair_spiky' && <path d="M 30 41 C 28 33, 32 24, 35 28 C 37 23, 42 31, 43 33 C 45 27, 49 22, 52 26 C 55 21, 60 28, 61 32 C 63 26, 68 22, 70 28 C 72 23, 77 33, 75 41 Z" fill="url(#hair-spiky)" />}
        {hair === 'hair_elegant' && <path d="M 33 40 C 33 24, 67 24, 67 40 C 60 42, 55 40, 50 42 C 45 40, 40 42, 33 40 Z" fill="url(#hair-elegant)" />}
        {hair === 'hair_flaming' && <path d="M 32 41 C 28 28, 38 18, 50 14 C 62 18, 68 41, 68 41 L 62 38 C 58 42, 53 38, 50 41 C 47 38, 42 42, 38 38 Z" fill="url(#hair-flaming)" />}
        {hair === 'hair_silver_wave' && <path d="M 33 40 C 33 24, 67 24, 67 40 C 60 42, 55 40, 50 42 C 45 40, 40 42, 33 40 Z" fill="url(#hair-silver_wave)" />}

        {/* Hats */}
        {hat === 'hat_bandana' && <path d="M 32 39.5 Q 50 36.5 68 39.5 L 67.5 43.5 Q 50 40.5 32.5 43.5 Z" fill="#ef4444" />}
        {hat === 'hat_wizard' && (
          <g>
            <path d="M 32 41 C 37 31, 44 20, 50 12 C 55 20, 61 31, 68 41 Z" fill="#4338ca" stroke="#1e1b4b" strokeWidth="0.4" />
            <ellipse cx="50" cy="42" rx="22" ry="2.5" fill="#312e81" stroke="#1e1b4b" strokeWidth="0.4" />
          </g>
        )}
        {hat === 'hat_crown' && <path d="M 34 38 L 31 22 L 41 28 L 50 18 L 59 28 L 69 22 L 66 38 Z" fill="#facc15" stroke="#854d0e" strokeWidth="0.4" />}
        {hat === 'hat_conqueror' && (
          <g>
            <path d="M 33 39 L 67 39 L 65 31 L 35 31 Z" fill="#1e293b" />
            <path d="M 31 39.5 Q 50 42.5 69 39.5 L 68 41 Q 50 44 32 41 Z" fill="#0f172a" />
          </g>
        )}
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
