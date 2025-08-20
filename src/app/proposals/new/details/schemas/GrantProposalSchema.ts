import { z } from 'zod'
import { getAddress, isAddress } from 'viem'
import { BaseProposalSchema } from './BaseProposalSchema'
import { TokenFieldsSchema } from './TokenSchema'
import { GRANT_TOKEN_LIMITS } from '@/lib/constants'
import { Milestones } from '@/app/proposals/shared/types'

// Grant proposal form schema
export const GrantProposalSchema = BaseProposalSchema.merge(TokenFieldsSchema)
  .extend({
    milestone: z
      .union([z.nativeEnum(Milestones), z.null(), z.undefined()])
      .refine(value => value !== undefined, {
        message: 'Please select a milestone option',
      }),

    targetAddress: z
      .string()
      .trim()
      .refine(value => isAddress(value, { strict: false }), 'Invalid Rootstock address')
      .transform(value => getAddress(value)),
  })
  .superRefine((data, ctx) => {
    const num = Number(data.transferAmount)
    const token = data.token
    const { maxAmount, minAmount } = GRANT_TOKEN_LIMITS
    if (num < minAmount) {
      ctx.addIssue({
        path: ['transferAmount'],
        message: `Grant amount is below minimum for ${token} (${minAmount})`,
        code: z.ZodIssueCode.custom,
      })
    }

    if (num > maxAmount) {
      ctx.addIssue({
        path: ['transferAmount'],
        message: `Grant amount is above maximum for ${token} (${maxAmount})`,
        code: z.ZodIssueCode.custom,
      })
    }
  })
export type GrantProposal = z.infer<typeof GrantProposalSchema>
