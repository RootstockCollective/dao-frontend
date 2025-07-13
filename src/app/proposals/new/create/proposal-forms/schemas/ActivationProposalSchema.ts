import z from 'zod'
import { isAddress } from 'viem'
import { BaseProposalSchema } from './BaseProposalSchema'

export const ActivationProposalSchema = BaseProposalSchema.extend({
  builderAddress: z.string().refine(val => isAddress(val), { message: 'Invalid builder address' }),
})
export type ActivationProposal = z.infer<typeof ActivationProposalSchema>
