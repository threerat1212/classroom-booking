import { z } from 'zod'

export const createAssignmentSchema = z.object({
  room_id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  assignment_type: z.enum(['individual', 'group']),
  max_score: z.coerce.number().int().min(0, 'Score must be at least 0').optional(),
  due_date: z.string().optional(),
  status: z.enum(['draft', 'published', 'closed']),
})

export const updateAssignmentSchema = createAssignmentSchema.partial()

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>
