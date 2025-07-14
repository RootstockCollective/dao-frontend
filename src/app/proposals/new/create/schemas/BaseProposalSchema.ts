import { z } from 'zod'

export const BaseProposalSchema = z.object({
  proposalName: z
    .string()
    .trim()
    .min(5, { message: 'Proposal name must be at least 5 characters' })
    .max(100, { message: 'Proposal name must be at most 100 characters' }),
  discourseLink: z.string().url({ message: 'Discourse link must be a valid URL' }),
  description: z
    .string()
    .trim()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(3000, { message: 'Description must be at most 3000 characters' }),
})

export type BaseProposalFormData = z.infer<typeof BaseProposalSchema>
