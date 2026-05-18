import { apiFetch, buildQuery } from '@/lib/http/client'

export interface Room {
  id: string
  name: string
  code: string
  room_type: string
  capacity: number
  floor?: number
  building?: string
  description?: string
  amenities?: string[]
  status: string
  image_url?: string
}

export function listRooms() {
  return apiFetch<{ data: Room[] }>('/api/v1/rooms')
}

export function getRoom(id: string) {
  return apiFetch<{ data: Room }>(`/api/v1/rooms/${id}`)
}

export function createRoom(data: Partial<Room>) {
  return apiFetch<{ data: Room }>('/api/v1/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateRoom(id: string, data: Partial<Room>) {
  return apiFetch<{ data: Room }>(`/api/v1/rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteRoom(id: string) {
  return apiFetch<void>(`/api/v1/rooms/${id}`, { method: 'DELETE' })
}
