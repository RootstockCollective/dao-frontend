import { z } from 'zod'
import { getAddress, isAddress } from 'viem'
import { BaseProposalSchema } from './BaseProposalSchema'
import { TokenFieldsSchema, TOKEN_FIELD_LIMITS } from './TokenSchema'
import { GRANT_TOKEN_LIMITS } from '@/lib/constants'
import { Milestones } from '@/app/proposals/shared/types'
import { isRnsDomain } from '@/lib/rns'

// Grant proposal form schema
export const GrantProposalSchema = BaseProposalSchema.merge(TokenFieldsSchema).extend({
  milestone: z.union([z.nativeEnum(Milestones), z.undefined()]).refine(value => value !== undefined, {
    message: 'Please select a milestone option',
  }),
  // user input for RNS or address
  targetAddressInput: z.string().trim().min(5, 'Target address or RNS is required'),
  // final target address - hidden field
  targetAddress: z
    .string()
    .trim()
    .refine(value => isAddress(value, { strict: false }), 'Invalid Rootstock address')
    .transform(value => getAddress(value)),
  targetAddressRNS: z
    .string()
    .trim()
    .optional()
    .refine(value => !value || isRnsDomain(value), 'Invalid RNS domain'),
  // Override transferAmount to add range validation
  transferAmount: z
    .string()
    .trim()
    .max(TOKEN_FIELD_LIMITS.transferAmount.maxLength, {
      message: `Amount is too long (max ${TOKEN_FIELD_LIMITS.transferAmount.maxLength} characters)`,
    })
    .nonempty({ message: 'Please enter transfer amount' })
    .refine(
      value => {
        const num = Number(value)
        return (
          !Number.isNaN(num) && num >= GRANT_TOKEN_LIMITS.minAmount && num <= GRANT_TOKEN_LIMITS.maxAmount
        )
      },
      {
        message: `Grant amount must be between ${GRANT_TOKEN_LIMITS.minAmount} and ${GRANT_TOKEN_LIMITS.maxAmount}`,
      },
    ),
})
export type GrantProposal = z.infer<typeof GrantProposalSchema>
