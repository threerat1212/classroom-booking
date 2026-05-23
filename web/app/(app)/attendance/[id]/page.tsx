'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSession, listRecords, upsertRecord } from '@/lib/api/attendance'
import { ArrowLeft, Play, RefreshCw, CheckCircle, Clock, AlertTriangle, UserMinus, Monitor, FileSpreadsheet, HelpCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

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
            เปิดหน้าจอโปรเจกเตอร์ (Live Board)
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
          <h2 className="text-sm font-bold text-white">รายชื่อผู้ลงทะเบียนเข้าเรียน</h2>
          <span className="text-xs text-slate-400 font-medium">ทั้งหมด {records?.length || 0} คน</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold bg-white/[0.01]">
                <th className="px-6 py-3">ชื่อนักเรียน</th>
                <th className="px-6 py-3">ฉายาติดตั้ง</th>
                <th className="px-6 py-3">สถานะเข้าเรียน</th>
                <th className="px-6 py-3">เวลาเช็คอิน</th>
                <th className="px-6 py-3">หมายเหตุ</th>
                <th className="px-6 py-3 text-right">ปรับสถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {records && records.length > 0 ? (
                records.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Name Column */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-sm font-black text-emerald-200">
                          {(row.student_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{row.student_name || 'ไม่ทราบชื่อ'}</span>
                      </div>
                    </td>
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
                    <td className="px-6 py-3 text-slate-400">{row.notes || '-'}</td>
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
