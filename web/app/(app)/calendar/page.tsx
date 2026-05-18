'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/http/client'
import { useQuery } from '@tanstack/react-query'
import { bookingKeys, roomKeys } from '@/lib/query/keys'

interface Booking {
  id: string
  room_id: string
  title: string
  purpose: string
  start_time: string
  end_time: string
  status: string
}

interface Room {
  id: string
  name: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
  cancelled: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)

function formatHour(h: number) {
  return `${h.toString().padStart(2, '0')}:00`
}

function useBookings() {
  return useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: async () => {
      const res = await apiFetch<{ data: Booking[] | null }>('/api/v1/bookings')
      return Array.isArray(res.data) ? res.data : []
    },
  })
}

function useRooms() {
  return useQuery({
    queryKey: roomKeys.lists(),
    queryFn: async () => {
      const res = await apiFetch<{ data: Room[] | null }>('/api/v1/rooms')
      return res.data || []
    },
  })
}

function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const startDay = firstDayOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Date[] = []
  for (let i = 0; i < startDay; i++) {
    const d = new Date(year, month, -startDay + i + 1)
    days.push(d)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i))
  }
  return days
}

function MonthView({
  date,
  bookings,
}: {
  date: Date
  bookings: Booking[]
}) {
  const days = getMonthGrid(date)
  const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })

  const bookingsForDay = (day: Date) => {
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)
    return bookings.filter((b) => {
      const bs = new Date(b.start_time)
      return bs >= start && bs <= end
    })
  }

  const isToday = (day: Date) => new Date().toDateString() === day.toDateString()
  const isCurrentMonth = (day: Date) => day.getMonth() === date.getMonth()

  return (
    <div className="space-y-3">
      <div className="text-center text-lg font-semibold text-white">{monthName}</div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs font-medium uppercase text-slate-400 py-2">
            {d}
          </div>
        ))}
        {days.map((day, idx) => {
          const dayBookings = bookingsForDay(day)
          const today = isToday(day)
          const currentMonth = isCurrentMonth(day)
          return (
            <div
              key={idx}
              className={`min-h-[80px] rounded-lg border p-2 ${today ? 'border-blue-500 ring-1 ring-blue-500' : 'border-white/10'} ${currentMonth ? 'bg-white/5' : 'bg-white/[0.02]'} transition-colors hover:bg-white/[0.07]`}
            >
              <div className={`text-sm font-semibold ${today ? 'text-blue-400' : currentMonth ? 'text-white' : 'text-slate-600'}`}>
                {day.getDate()}
              </div>
              <div className="mt-1 space-y-0.5">
                {dayBookings.slice(0, 2).map((b) => (
                  <div key={b.id} className={`truncate rounded border px-1 py-0.5 text-[10px] font-medium ${statusColors[b.status] || 'bg-white/5 text-slate-300 border-white/10'}`}>
                    {b.title}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-[10px] text-slate-500">+{dayBookings.length - 2} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const { data: bookings, isLoading: bookingsLoading } = useBookings()
  const { data: rooms, isLoading: roomsLoading } = useRooms()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    days.push(d)
  }

  const prev = () => {
    const d = new Date(currentDate)
    if (view === 'month') {
      d.setMonth(d.getMonth() - 1)
    } else {
      d.setDate(d.getDate() - (view === 'week' ? 7 : 1))
    }
    setCurrentDate(d)
  }

  const next = () => {
    const d = new Date(currentDate)
    if (view === 'month') {
      d.setMonth(d.getMonth() + 1)
    } else {
      d.setDate(d.getDate() + (view === 'week' ? 7 : 1))
    }
    setCurrentDate(d)
  }

  const bookingsForDay = (day: Date) => {
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)
    if (!Array.isArray(bookings)) return []
    return bookings.filter((b) => {
      const bs = new Date(b.start_time)
      return bs >= start && bs <= end
    })
  }

  const isLoading = bookingsLoading || roomsLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="mt-1 text-sm text-slate-400">Room booking schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setView('month')}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${view === 'month' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${view === 'week' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${view === 'day' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Day
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={prev}>Previous</Button>
          <Button variant="outline" size="sm" onClick={next}>Next</Button>
        </div>
      </div>

      {view === 'month' ? (
        <MonthView date={currentDate} bookings={bookings ?? []} />
      ) : view === 'week' ? (
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-medium uppercase text-slate-400">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const dayBookings = bookingsForDay(day)
            const isToday = new Date().toDateString() === day.toDateString()
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] rounded-lg border bg-white/5 p-3 ${isToday ? 'border-blue-500 ring-1 ring-blue-500' : 'border-white/10'}`}
              >
                <div className="text-sm font-semibold text-white">{day.getDate()}</div>
                <div className="mt-2 space-y-1">
                  {dayBookings.map((b) => (
                    <div key={b.id} className={`truncate rounded border px-2 py-1 text-xs font-medium ${statusColors[b.status] || 'bg-white/5 text-slate-300 border-white/10'}`}>
                      {b.title}
                    </div>
                  ))}
                  {dayBookings.length === 0 && (
                    <div className="text-xs text-slate-500">No bookings</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <DayView
          date={currentDate}
          bookings={bookings ?? []}
          rooms={rooms ?? []}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

function DayView({
  date,
  bookings,
  rooms,
  isLoading,
}: {
  date: Date
  bookings: Booking[]
  rooms: Room[]
  isLoading: boolean
}) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const dayBookings = bookings.filter((b) => {
    const bs = new Date(b.start_time)
    return bs >= start && bs <= end
  })

  const getBookingsForRoomAndHour = (roomId: string, hour: number) => {
    return dayBookings.filter((b) => {
      if (b.room_id !== roomId) return false
      const bs = new Date(b.start_time)
      const be = new Date(b.end_time)
      const slotStart = new Date(date)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(date)
      slotEnd.setHours(hour + 1, 0, 0, 0)
      return bs < slotEnd && be > slotStart
    })
  }

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px] rounded-lg border border-white/10 bg-white/5">
        <div className="grid border-b border-white/10" style={{ gridTemplateColumns: `80px repeat(${rooms.length}, minmax(140px, 1fr))` }}>
          <div className="border-r border-white/10 px-3 py-2 text-xs font-medium uppercase text-slate-400">
            Time
          </div>
          {rooms.map((room) => (
            <div key={room.id} className="border-r border-white/10 px-3 py-2 text-center text-xs font-medium uppercase text-slate-400 last:border-r-0">
              {room.name}
            </div>
          ))}
        </div>

        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid border-b border-white/10 last:border-b-0"
            style={{ gridTemplateColumns: `80px repeat(${rooms.length}, minmax(140px, 1fr))` }}
          >
            <div className="flex items-center border-r border-white/10 px-3 py-2 text-xs font-medium text-slate-400">
              {formatHour(hour)}
            </div>
            {rooms.map((room) => {
              const slotBookings = getBookingsForRoomAndHour(room.id, hour)
              return (
                <div key={room.id} className="relative border-r border-white/10 p-1 last:border-r-0 min-h-[60px]">
                  {slotBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`mb-1 rounded border px-2 py-1 text-xs font-medium ${statusColors[b.status] || 'bg-white/5 text-slate-300 border-white/10'}`}
                    >
                      <div className="truncate">{b.title}</div>
                      <div className="text-[10px] opacity-80">
                        {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
