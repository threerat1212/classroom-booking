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

export function listBookings() {
  return apiFetch<{ data: Booking[] }>('/api/v1/bookings')
}

export function getBooking(id: string) {
  return apiFetch<{ data: Booking }>(`/api/v1/bookings/${id}`)
}

export function createBooking(data: CreateBookingInput) {
  return apiFetch<{ data: Booking }>('/api/v1/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateBooking(id: string, data: Partial<CreateBookingInput>) {
  return apiFetch<{ data: Booking }>(`/api/v1/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteBooking(id: string) {
  return apiFetch<void>(`/api/v1/bookings/${id}`, { method: 'DELETE' })
}

export function approveBooking(id: string) {
  return apiFetch<void>(`/api/v1/bookings/${id}/approve`, { method: 'POST' })
}

export function rejectBooking(id: string, reason: string) {
  return apiFetch<void>(`/api/v1/bookings/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}
