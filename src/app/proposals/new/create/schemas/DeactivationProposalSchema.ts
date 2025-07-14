import z from 'zod'
import { BaseProposalSchema } from './BaseProposalSchema'
import { isAddress } from 'viem'

export const DeactivationProposalSchema = BaseProposalSchema.extend({
  builderAddress: z
    .string()
    .refine(val => isAddress(val), { message: 'Invalid builder address to de-whitelist' }),
})
export type DeactivationProposal = z.infer<typeof DeactivationProposalSchema>
