import { apiFetch } from '@/lib/http/client'

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
