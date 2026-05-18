import { z } from 'zod'

export const createSessionSchema = z.object({
  room_id: z.string().uuid(),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  start_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  end_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  status: z.enum(['open', 'closed', 'cancelled']),
})

export const upsertRecordSchema = z.object({
  session_id: z.string().uuid(),
  student_id: z.string().uuid(),
  status: z.enum(['present', 'late', 'leave', 'absent']),
  notes: z.string().optional(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpsertRecordInput = z.infer<typeof upsertRecordSchema>
