import { z } from 'zod'
import { isAddress } from 'viem'
import { BaseProposalSchema } from './BaseProposalSchema'
import { TokenFieldsSchema } from './TokenSchema'
import { GRANT_TOKEN_LIMITS } from '@/lib/constants'

// Grant proposal form schema
export const GrantProposalSchema = BaseProposalSchema.merge(TokenFieldsSchema)
  .extend({
    targetAddress: z.string().refine(val => isAddress(val), { message: 'Invalid Rootstock address' }),
  })
  .superRefine((data, ctx) => {
    const num = Number(data.transferAmount)
    const token = data.token
    const { maxAmount, minAmount } = GRANT_TOKEN_LIMITS
    if (num <= minAmount) {
      ctx.addIssue({
        path: ['transferAmount'],
        message: `Grant amount is below minimum for ${token} (${minAmount})`,
        code: z.ZodIssueCode.custom,
      })
    }

    if (num >= maxAmount) {
      ctx.addIssue({
        path: ['transferAmount'],
        message: `Grant amount is above maximum for ${token} (${maxAmount})`,
        code: z.ZodIssueCode.custom,
      })
    }
  })
export type GrantProposal = z.infer<typeof GrantProposalSchema>
