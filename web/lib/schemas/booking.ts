import { z } from 'zod'

export const bookingSchema = z.object({
  room_id: z.string().min(1, 'Room is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  purpose: z.enum(['class', 'meeting', 'exam', 'event', 'other']),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
}).refine((data) => {
  if (!data.start_time || !data.end_time) return true
  return new Date(data.end_time) > new Date(data.start_time)
}, {
  message: 'End time must be after start time',
  path: ['end_time'],
})

export type BookingInput = z.infer<typeof bookingSchema>
