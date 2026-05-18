import { z } from 'zod'

export const createBadgeSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  icon_url: z.string().url().optional(),
  criteria: z.string().min(1),
})

export const awardBadgeSchema = z.object({
  student_id: z.string().uuid(),
  badge_id: z.string().uuid(),
  context: z.string().optional(),
})

export type CreateBadgeInput = z.infer<typeof createBadgeSchema>
export type AwardBadgeInput = z.infer<typeof awardBadgeSchema>
