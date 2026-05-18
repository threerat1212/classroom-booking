import { z } from 'zod'

export const upsertGradeSchema = z.object({
  student_id: z.string().uuid(),
  item_type: z.enum(['assignment', 'exam', 'quiz', 'participation']),
  item_id: z.string().uuid(),
  score: z.number().int().min(0),
  max_score: z.number().int().min(1),
  feedback: z.string().optional(),
})

export type UpsertGradeInput = z.infer<typeof upsertGradeSchema>
