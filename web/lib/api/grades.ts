import { apiFetch } from '@/lib/http/client'

export interface Grade {
  id: string
  student_id: string
  item_type: string
  item_id: string
  score: number
  max_score: number
  grade_code?: string
  feedback?: string
  graded_by?: string
  created_at: string
}

export interface UpsertGradePayload {
  student_id: string
  item_type: string
  item_id: string
  score: number
  max_score: number
  grade_code?: string
  feedback?: string
}

export function listGrades(studentId?: string) {
  const params = new URLSearchParams()
  if (studentId) params.append('student_id', studentId)
  return apiFetch<{ data: Grade[] }>(`/api/v1/grades?${params.toString()}`)
}

export function getGrade(id: string) {
  return apiFetch<{ data: Grade }>(`/api/v1/grades/${id}`)
}

export function upsertGrade(payload: UpsertGradePayload) {
  return apiFetch<{ data: Grade }>('/api/v1/grades', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteGrade(id: string) {
  return apiFetch(`/api/v1/grades/${id}`, { method: 'DELETE' })
}
