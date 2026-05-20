'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSession, listRecords, upsertRecord, AttendanceRecord } from '@/lib/api/attendance'
import { ArrowLeft, Play, RefreshCw, CheckCircle, Clock, AlertTriangle, UserMinus, Monitor, FileSpreadsheet, HelpCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

// Quick Vector Layer Render for Table rows
function CharacterMiniSprite({ hair = 'hair_novice', hat = 'hat_none', outfit = 'outfit_novice', aura = 'aura_none' }) {
  // Color mappings for hair styles
  const hairColors: Record<string, string> = {
    hair_novice: '#d97706',
    hair_spiky: '#3b82f6',
    hair_elegant: '#c084fc',
    hair_flaming: '#f97316',
    hair_silver_wave: '#f8fafc',
  }
  const outfitColors: Record<string, string> = {
    outfit_novice: '#a1a1aa',
    outfit_apprentice: '#10b981',
    outfit_wizard: '#8b5cf6',
    outfit_plate: '#e2e8f0',
    outfit_god: '#fbbf24',
  }

  const hColor = hairColors[hair] || '#78350f'
  const oColor = outfitColors[outfit] || '#52525b'

  return (
    <div className="relative w-8 h-8 rounded bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-5/6 h-5/6">
        {/* Neck */}
        <rect x="46" y="58" width="8" height="6" fill="#fde0c0" />

        {/* Torso */}
        <path d="M 38 64 L 62 64 C 64 74, 63 86, 50 86 C 37 86, 36 74, 38 64 Z" fill={oColor} />
        <path d="M 44 64 L 50 70 L 56 64" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />

        {/* Head */}
        <path d="M 34 42 C 34 32, 66 32, 66 42 C 66 52, 62 60, 50 60 C 38 60, 34 52, 34 42 Z" fill="#fde0c0" stroke="#c2410c" strokeWidth="0.4" />

        {/* Eyes (Mini cute anime eyes) */}
        <ellipse cx="43" cy="46" rx="2" ry="3.5" fill="#ffffff" />
        <ellipse cx="43" cy="46" rx="1.2" ry="3.1" fill={hColor} />
        <circle cx="42.5" cy="44.5" r="0.6" fill="#ffffff" />
        <path d="M 40 44 Q 43 42 46 44" fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />

        <ellipse cx="57" cy="46" rx="2" ry="3.5" fill="#ffffff" />
        <ellipse cx="57" cy="46" rx="1.2" ry="3.1" fill={hColor} />
        <circle cx="56.5" cy="44.5" r="0.6" fill="#ffffff" />
        <path d="M 54 44 Q 57 42 60 44" fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />

        <ellipse cx="39" cy="51" rx="2" ry="0.8" fill="#fca5a5" opacity="0.6" />
        <ellipse cx="61" cy="51" rx="2" ry="0.8" fill="#fca5a5" opacity="0.6" />
        <path d="M 48.5 53 Q 50 54.5 51.5 53" fill="none" stroke="#c2410c" strokeWidth="0.8" strokeLinecap="round" />

        {/* Hair Side Strands */}
        {hair === 'hair_novice' && (
          <g>
            <path d="M 32 40 C 30 46, 32 54, 34 54 Z" fill={hColor} />
            <path d="M 68 40 C 70 46, 68 54, 66 54 Z" fill={hColor} />
          </g>
        )}
        {hair === 'hair_elegant' && (
          <g>
            <path d="M 33 40 C 25 46, 26 62, 30 65 Z" fill={hColor} />
            <path d="M 67 40 C 75 46, 74 62, 70 65 Z" fill={hColor} />
          </g>
        )}

        {/* Hair overlay */}
        {hair === 'hair_novice' && <path d="M 32 40 C 32 20, 68 20, 68 40 C 62 44, 56 40, 50 44 C 44 40, 38 44, 32 40 Z" fill={hColor} />}
        {hair === 'hair_spiky' && <path d="M 30 41 C 28 33, 32 24, 35 28 C 37 23, 42 31, 43 33 C 45 27, 49 22, 52 26 C 55 21, 60 28, 61 32 C 63 26, 68 22, 70 28 C 72 23, 77 33, 75 41 Z" fill={hColor} />}
        {hair === 'hair_elegant' && <path d="M 33 40 C 33 24, 67 24, 67 40 C 60 42, 55 40, 50 42 C 45 40, 40 42, 33 40 Z" fill={hColor} />}
        {hair === 'hair_flaming' && <path d="M 32 41 C 28 28, 38 18, 50 14 C 62 18, 68 41, 68 41 L 62 38 C 58 42, 53 38, 50 41 Z" fill="url(#miniFlame)" />}
        {hair === 'hair_silver_wave' && <path d="M 33 40 C 33 24, 67 24, 67 40 C 60 42, 55 40, 50 42 Z" fill={hColor} />}

        {/* Hats */}
        {hat === 'hat_bandana' && <path d="M 32 39.5 Q 50 36.5 68 39.5 L 67.5 43.5 Q 50 40.5 32.5 43.5 Z" fill="#ef4444" />}
        {hat === 'hat_wizard' && (
          <g>
            <path d="M 32 41 C 37 31, 44 20, 50 12 C 55 20, 61 31, 68 41 Z" fill="#4338ca" />
            <ellipse cx="50" cy="42" rx="22" ry="2.5" fill="#312e81" />
          </g>
        )}
        {hat === 'hat_crown' && <path d="M 34 38 L 31 22 L 41 28 L 50 18 L 59 28 L 69 22 L 66 38 Z" fill="#facc15" stroke="#854d0e" strokeWidth="0.4" />}
        {hat === 'hat_conqueror' && (
          <g>
            <path d="M 33 39 L 67 39 L 65 31 Z" fill="#1e293b" />
            <path d="M 31 39.5 Q 50 42.5 69 39.5 Z" fill="#0f172a" />
          </g>
        )}

        <defs>
          <linearGradient id="miniFlame" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default function AttendanceDetailPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const queryClient = useQueryClient()

  // Fetch session details
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['attendance-session', id],
    queryFn: async () => {
      const res = await getSession(id)
      return res.data
    },
  })

  // Fetch student check-in records for this session
  const { data: records, isLoading: recordsLoading, refetch: refetchRecords } = useQuery({
    queryKey: ['attendance-records', id],
    queryFn: async () => {
      const res = await listRecords(id)
      return res.data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (payload: { studentId: string; status: string }) => {
      await upsertRecord({
        session_id: id,
        student_id: payload.studentId,
        status: payload.status,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records', id] })
    },
  })

  if (sessionLoading || recordsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-white/5" />
        <Skeleton className="h-64 w-full bg-white/5 rounded-xl" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400">
        ไม่พบรายการคาบเรียนที่ระบุ
      </div>
    )
  }

  const handleStatusChange = (studentId: string, status: string) => {
    updateStatusMutation.mutate({ studentId, status })
  }

  const statusIcons: Record<string, React.ReactNode> = {
    present: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    late: <Clock className="h-4 w-4 text-amber-400" />,
    leave: <AlertTriangle className="h-4 w-4 text-cyan-400" />,
    absent: <UserMinus className="h-4 w-4 text-rose-400" />,
  }

  const statusLabels: Record<string, string> = {
    present: 'มาเรียน (Present)',
    late: 'มาสาย (Late)',
    leave: 'ลา (Leave)',
    absent: 'ขาดเรียน (Absent)',
  }

  return (
    <div className="space-y-6">
      {/* Back navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          ย้อนกลับ
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Link to Live Flexboard */}
          <Link
            href={`/attendance/${id}/flexboard`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-lg shadow-violet-500/20 transition-all"
          >
            <Monitor className="h-4 w-4" />
            เปิดหน้าจอโปรเจกเตอร์ขิงตัวละคร (Live Flexboard)
          </Link>

          <button
            onClick={() => refetchRecords()}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            รีเฟรชข้อมูล
          </button>
        </div>
      </div>

      {/* Session summary details card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">ห้องเรียน (Room ID)</span>
            <p className="mt-1 text-sm font-semibold text-white font-mono">{session.room_id.slice(0, 8)}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">วันที่คลาสเรียน</span>
            <p className="mt-1 text-sm font-semibold text-white">{new Date(session.session_date).toLocaleDateString('th-TH')}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">ช่วงเวลา</span>
            <p className="mt-1 text-sm font-semibold text-white">
              {session.start_time.slice(11, 16)} - {session.end_time.slice(11, 16)} น.
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">สถานะคาบเรียน</span>
            <p className="mt-1 text-sm font-semibold text-white uppercase">{session.status}</p>
          </div>
        </div>
      </div>

      {/* Grid containing students and check-in summary */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="border-b border-white/10 bg-white/[0.02] px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">รายชื่อผู้ลงทะเบียนเข้าเรียนและตัวละครแต่งตัว</h2>
          <span className="text-xs text-slate-400 font-medium">ทั้งหมด {records?.length || 0} คน</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold bg-white/[0.01]">
                <th className="px-6 py-3">ตัวละคร</th>
                <th className="px-6 py-3">ชื่อนักเรียน</th>
                <th className="px-6 py-3">ฉายาติดตั้ง</th>
                <th className="px-6 py-3">สถานะเข้าเรียน</th>
                <th className="px-6 py-3">เวลาเช็คอิน</th>
                <th className="px-6 py-3 text-right">ปรับสถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {records && records.length > 0 ? (
                records.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Character Column */}
                    <td className="px-6 py-3">
                      <CharacterMiniSprite
                        hair={row.equipped_hair}
                        hat={row.equipped_hat}
                        outfit={row.equipped_outfit}
                        aura={row.equipped_aura}
                      />
                    </td>
                    {/* Name Column */}
                    <td className="px-6 py-3 font-semibold text-white">{row.student_name || 'ไม่ทราบชื่อ'}</td>
                    {/* Title Column */}
                    <td className="px-6 py-3">
                      {row.student_title ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-violet-500/30 bg-violet-950/20 text-violet-300">
                          👑 {row.student_title}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">-</span>
                      )}
                    </td>
                    {/* Status Column */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 font-medium">
                        {statusIcons[row.status] || <HelpCircle className="h-4 w-4 text-slate-500" />}
                        {statusLabels[row.status] || row.status}
                      </div>
                    </td>
                    {/* Time Column */}
                    <td className="px-6 py-3 font-mono text-slate-400">
                      {row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString('th-TH') : '-'}
                    </td>
                    {/* Actions Column */}
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex rounded-lg border border-white/10 bg-slate-950/50 p-0.5 overflow-hidden">
                        {(['present', 'late', 'leave', 'absent'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleStatusChange(row.student_id, st)}
                            disabled={updateStatusMutation.isPending}
                            className={`px-2 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${
                              row.status === st
                                ? 'bg-white/15 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    ยังไม่มีบันทึกการเข้าเรียนในคาบเรียนนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
