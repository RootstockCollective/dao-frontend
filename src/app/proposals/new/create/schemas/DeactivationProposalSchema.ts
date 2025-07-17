import z from 'zod'
import { BaseProposalSchema } from './BaseProposalSchema'
import { isAddressRegex } from '@/app/proposals/shared/utils'
import { Address, getAddress } from 'viem'

export const DeactivationProposalSchema = BaseProposalSchema.extend({
  builderAddress: z
    .string()
    .refine(value => isAddressRegex(value), 'Write or paste the address to be de-whitelisted')
    .transform(value => getAddress(value) as Address),
})
export type DeactivationProposal = z.infer<typeof DeactivationProposalSchema>
