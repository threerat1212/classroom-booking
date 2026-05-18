import { z } from 'zod'

export const roomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  room_type: z.enum(['classroom', 'meeting_room', 'lab', 'auditorium', 'other']),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  floor: z.coerce.number().int().optional(),
  building: z.string().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  status: z.enum(['available', 'maintenance', 'closed']).optional(),
})

export type RoomInput = z.infer<typeof roomSchema>
