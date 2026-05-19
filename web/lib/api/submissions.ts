import { apiFetch } from '@/lib/http/client'

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  content?: string
  file_urls?: string[]
  external_link?: string
  submitted_at: string
  status: string
  score?: number
  grade_code?: string
  feedback?: string
}

export interface CreateSubmissionPayload {
  assignment_id: string
  content?: string
  file_urls?: string[]
  external_link?: string
}

export interface UpdateSubmissionPayload {
  content?: string
  file_urls?: string[]
  external_link?: string
}

export interface GradeSubmissionPayload {
  score: number
  feedback?: string
  grade_code?: string
}

export function listSubmissions(assignmentId?: string, studentId?: string) {
  const params = new URLSearchParams()
  if (assignmentId) params.append('assignment_id', assignmentId)
  if (studentId) params.append('student_id', studentId)
  return apiFetch<{ data: Submission[] }>(`/api/v1/submissions?${params.toString()}`)
}

export function getSubmission(id: string) {
  return apiFetch<{ data: Submission }>(`/api/v1/submissions/${id}`)
}

export function createSubmission(payload: CreateSubmissionPayload) {
  return apiFetch<{ data: Submission }>('/api/v1/submissions', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateSubmission(id: string, payload: UpdateSubmissionPayload) {
  return apiFetch<{ data: Submission }>(`/api/v1/submissions/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteSubmission(id: string) {
  return apiFetch(`/api/v1/submissions/${id}`, { method: 'DELETE' })
}

export function gradeSubmission(id: string, payload: GradeSubmissionPayload) {
  return apiFetch<{ data: Submission }>(`/api/v1/submissions/${id}/grade`, { method: 'POST', body: JSON.stringify(payload) })
}
