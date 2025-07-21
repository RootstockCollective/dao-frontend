import z from 'zod'
import { getAddress, isAddress } from 'viem'
import { BaseProposalSchema } from './BaseProposalSchema'

export const ACTIVATION_PROPOSAL_LIMITS = {
  builderName: {
    min: 5,
    max: 100,
  },
}

export const ActivationProposalSchema = BaseProposalSchema.extend({
  builderName: z
    .string()
    .trim()
    .min(ACTIVATION_PROPOSAL_LIMITS.builderName.min, {
      message: 'Builder name must contain at least 5 characters',
    })
    .max(ACTIVATION_PROPOSAL_LIMITS.builderName.max, {
      message: 'Builder name must be at most 100 characters',
    }),
  builderAddress: z
    .string()
    .refine(val => isAddress(val, { strict: false }), { message: 'Invalid builder address' })
    .transform(value => getAddress(value)),
})
export type ActivationProposal = z.infer<typeof ActivationProposalSchema>
