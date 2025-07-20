import z from 'zod'
import { BaseProposalSchema } from './BaseProposalSchema'
import { getAddress, isAddress } from 'viem'

export const DeactivationProposalSchema = BaseProposalSchema.extend({
  builderAddress: z
    .string()
    .trim()
    .refine(value => isAddress(value, { strict: false }), 'Write or paste the address to be de-whitelisted')
    .transform(value => getAddress(value)),
})
export type DeactivationProposal = z.infer<typeof DeactivationProposalSchema>
