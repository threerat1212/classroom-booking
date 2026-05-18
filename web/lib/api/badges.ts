import { apiFetch } from '@/lib/http/client'

export interface Badge {
  id: string
  name: string
  description: string
  icon_url?: string
  criteria: string
  created_at: string
}

export interface StudentBadge {
  id: string
  student_id: string
  badge_id: string
  awarded_at: string
  awarded_by?: string
  context?: string
}

export interface AwardBadgePayload {
  student_id: string
  badge_id: string
  context?: string
}

export function listBadges() {
  return apiFetch<{ data: Badge[] }>('/api/v1/badges')
}

export function getBadge(id: string) {
  return apiFetch<{ data: Badge }>(`/api/v1/badges/${id}`)
}

export function createBadge(payload: { name: string; description?: string; icon_url?: string; criteria: string }) {
  return apiFetch<{ data: Badge }>('/api/v1/badges', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteBadge(id: string) {
  return apiFetch(`/api/v1/badges/${id}`, { method: 'DELETE' })
}

export function listStudentBadges(studentId: string) {
  return apiFetch<{ data: StudentBadge[] }>(`/api/v1/badges/student/${studentId}`)
}

export function awardBadge(payload: AwardBadgePayload) {
  return apiFetch<{ data: StudentBadge }>('/api/v1/badges/award', { method: 'POST', body: JSON.stringify(payload) })
}
