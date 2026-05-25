import { apiFetch } from '@/lib/http/client'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  type: 'booking' | 'assignment' | 'attendance' | 'quest'
  color: string
}

export async function fetchCalendarEvents(start?: string, end?: string) {
  const params = new URLSearchParams()
  if (start) params.append('start', start)
  if (end) params.append('end', end)
  const query = params.toString() ? `?${params.toString()}` : ''

  const res = await apiFetch<{ data: CalendarEvent[] }>(`/api/v1/calendar${query}`)
  return res.data
}
