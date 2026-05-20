import { apiFetch } from '@/lib/http/client'

export interface AttendanceSession {
  id: string
  room_id: string
  teacher_id: string
  session_date: string
  start_time: string
  end_time: string
  status: string
  qr_code?: string
}

export interface AttendanceRecord {
  id: string
  session_id: string
  student_id: string
  status: string
  check_in_time?: string
  check_out_time?: string
  notes?: string
  student_name?: string
  student_title?: string
  equipped_hair?: string
  equipped_hat?: string
  equipped_outfit?: string
  equipped_aura?: string
}

export interface CreateSessionPayload {
  room_id: string
  session_date: string
  start_time: string
  end_time: string
  status: string
}

export interface UpsertRecordPayload {
  session_id: string
  student_id: string
  status: string
  notes?: string
}

export function listSessions() {
  return apiFetch<{ data: AttendanceSession[] }>('/api/v1/attendance/sessions')
}

export function getSession(id: string) {
  return apiFetch<{ data: AttendanceSession }>(`/api/v1/attendance/sessions/${id}`)
}

export function createSession(payload: CreateSessionPayload) {
  return apiFetch<{ data: AttendanceSession }>('/api/v1/attendance/sessions', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteSession(id: string) {
  return apiFetch(`/api/v1/attendance/sessions/${id}`, { method: 'DELETE' })
}

export function listRecords(sessionId?: string, studentId?: string) {
  const params = new URLSearchParams()
  if (sessionId) params.append('session_id', sessionId)
  if (studentId) params.append('student_id', studentId)
  return apiFetch<{ data: AttendanceRecord[] }>(`/api/v1/attendance/records?${params.toString()}`)
}

export function upsertRecord(payload: UpsertRecordPayload) {
  return apiFetch<{ data: AttendanceRecord }>('/api/v1/attendance/records', { method: 'POST', body: JSON.stringify(payload) })
}
