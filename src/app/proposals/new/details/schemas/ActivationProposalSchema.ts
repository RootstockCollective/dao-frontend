import z from 'zod'
import { isAddress } from 'viem'
import { BaseProposalSchema } from './BaseProposalSchema'

export const ActivationProposalSchema = BaseProposalSchema.extend({
  builderName: z
    .string()
    .trim()
    .min(5, { message: 'Builder name must contain at least 5 characters' })
    .max(100, { message: 'Builder name must be at most 100 characters' }),
  builderAddress: z.string().refine(val => isAddress(val), { message: 'Invalid builder address' }),
})
export type ActivationProposal = z.infer<typeof ActivationProposalSchema>
