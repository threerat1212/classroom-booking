import { apiFetch } from '@/lib/http/client'

export interface Booking {
  id: string
  room_id: string
  title: string
  description?: string
  purpose: string
  start_time: string
  end_time: string
  status: string
  rejection_reason?: string
}

export interface CreateBookingInput {
  room_id: string
  title: string
  description?: string
  purpose: string
  start_time: string
  end_time: string
}

function normalizeBookingTimes<T extends Partial<CreateBookingInput>>(data: T): T {
  const normalized = { ...data }

  if (normalized.start_time) {
    normalized.start_time = new Date(normalized.start_time).toISOString()
  }

  if (normalized.end_time) {
    normalized.end_time = new Date(normalized.end_time).toISOString()
  }

  return normalized
}

export function listBookings() {
  return apiFetch<{ data: Booking[] }>('/api/v1/bookings')
}

export function getBooking(id: string) {
  return apiFetch<{ data: Booking }>(`/api/v1/bookings/${id}`)
}

export function createBooking(data: CreateBookingInput) {
  return apiFetch<{ data: Booking }>('/api/v1/bookings', {
    method: 'POST',
    body: JSON.stringify(normalizeBookingTimes(data)),
  })
}

export function updateBooking(id: string, data: Partial<CreateBookingInput>) {
  return apiFetch<{ data: Booking }>(`/api/v1/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(normalizeBookingTimes(data)),
  })
}

export function deleteBooking(id: string) {
  return apiFetch<void>(`/api/v1/bookings/${id}`, { method: 'DELETE' })
}

export function approveBooking(id: string) {
  return apiFetch<void>(`/api/v1/bookings/${id}/approve`, { method: 'PATCH' })
}

export function rejectBooking(id: string, reason: string) {
  return apiFetch<void>(`/api/v1/bookings/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  })
}
