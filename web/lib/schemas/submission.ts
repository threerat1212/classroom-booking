import { z } from 'zod'

export const createSubmissionSchema = z.object({
  assignment_id: z.string().uuid(),
  content: z.string().optional(),
  file_urls: z.array(z.string().url()).optional(),
  external_link: z.string().url().optional(),
})

export const updateSubmissionSchema = createSubmissionSchema.partial().omit({ assignment_id: true })

export const gradeSubmissionSchema = z.object({
  score: z.number().int().min(0),
  feedback: z.string().optional(),
})

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>
