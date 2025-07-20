import z from 'zod'
import { getAddress, isAddress } from 'viem'
import { BaseProposalSchema } from './BaseProposalSchema'

export const ActivationProposalSchema = BaseProposalSchema.extend({
  builderName: z
    .string()
    .trim()
    .min(5, { message: 'Builder name must contain at least 5 characters' })
    .max(100, { message: 'Builder name must be at most 100 characters' }),
  builderAddress: z
    .string()
    .refine(val => isAddress(val, { strict: false }), { message: 'Invalid builder address' })
    .transform(value => getAddress(value)),
})
export type ActivationProposal = z.infer<typeof ActivationProposalSchema>
