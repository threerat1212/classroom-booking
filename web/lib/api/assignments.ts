import { getAccessToken } from '@/lib/auth/session'
import { API_BASE, ApiError, apiFetch } from '@/lib/http/client'

export interface Assignment {
  id: string
  teacher_id: string
  room_id?: string
  title: string
  description?: string
  assignment_type: string
  max_score?: number
  due_date?: string
  status: string
}

export interface AssignmentGradebookRow {
  student_id: string
  student_name: string
  student_email: string
  submission_id?: string
  status: string
  score?: number
  max_score: number
  percent?: number
  grade_code: string
  feedback?: string
  submitted_at?: string
  graded_at?: string
}

export function listAssignments() {
  return apiFetch<{ data: Assignment[] }>('/api/v1/assignments')
}

export function getAssignment(id: string) {
  return apiFetch<{ data: Assignment }>(`/api/v1/assignments/${id}`)
}

export function createAssignment(data: Partial<Assignment>) {
  return apiFetch<{ data: Assignment }>('/api/v1/assignments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateAssignment(id: string, data: Partial<Assignment>) {
  return apiFetch<{ data: Assignment }>(`/api/v1/assignments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteAssignment(id: string) {
  return apiFetch<void>(`/api/v1/assignments/${id}`, { method: 'DELETE' })
}

export function listAssignmentGradebook(id: string) {
  return apiFetch<{ data: AssignmentGradebookRow[] }>(`/api/v1/assignments/${id}/gradebook`)
}

export async function downloadAssignmentGradebook(id: string) {
  const token = typeof window !== 'undefined' ? getAccessToken() : null
  const res = await fetch(`${API_BASE}/api/v1/assignments/${id}/gradebook.xlsx`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(
      res.status,
      body?.error?.code || 'UNKNOWN',
      body?.error?.message || `HTTP ${res.status}`,
      body?.error?.details,
    )
  }
  return res.blob()
}
