import { z } from 'zod'

export const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  type: z.enum(['info', 'warning', 'success', 'error']),
  channel: z.enum(['in_app', 'line', 'email']),
  action_url: z.string().url().optional(),
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
