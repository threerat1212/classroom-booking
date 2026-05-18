import { apiFetch } from '@/lib/http/client'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  channel: string
  read_at?: string
  action_url?: string
  created_at: string
}

export interface CreateNotificationPayload {
  user_id: string
  title: string
  message: string
  type: string
  channel: string
  action_url?: string
}

export function listNotifications(limit = 20, offset = 0) {
  return apiFetch<{ data: Notification[] }>(`/api/v1/notifications?limit=${limit}&offset=${offset}`)
}

export function getNotification(id: string) {
  return apiFetch<{ data: Notification }>(`/api/v1/notifications/${id}`)
}

export function createNotification(payload: CreateNotificationPayload) {
  return apiFetch<{ data: Notification }>('/api/v1/notifications', { method: 'POST', body: JSON.stringify(payload) })
}

export function markRead(id: string) {
  return apiFetch(`/api/v1/notifications/${id}/read`, { method: 'POST' })
}

export function markAllRead() {
  return apiFetch('/api/v1/notifications/read-all', { method: 'POST' })
}
