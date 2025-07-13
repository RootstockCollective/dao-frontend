import { z } from 'zod'
import { isAddress } from 'viem'
import { BaseProposalSchema } from './BaseProposalSchema'
import { TokenFieldsSchema } from './TokenSchema'
import { ENV } from '@/lib/constants'

// grant limits
const MIN_AMOUNT = {
  mainnet: {
    rBTC: 0.0001,
    RIF: 10,
  },
  testnet: {
    rBTC: 0.000001,
    RIF: 1,
  },
}

const MAX_AMOUNT = {
  mainnet: {
    rBTC: 21,
    RIF: 1_000_000,
  },
  testnet: {
    rBTC: 21,
    RIF: 1_000_000,
  },
}

// Grant proposal form schema
export const GrantProposalSchema = BaseProposalSchema.merge(TokenFieldsSchema)
  .extend({
    targetAddress: z.string().refine(val => isAddress(val), { message: 'Invalid Rootstock address' }),
  })
  .superRefine((data, ctx) => {
    const num = Number(data.transferAmount)
    const token = data.token
    const minAmount = MIN_AMOUNT[ENV]
    const maxAmount = MAX_AMOUNT[ENV]

    if (token in minAmount && num < minAmount[token]) {
      ctx.addIssue({
        path: ['transferAmount'],
        message: `Grant amount is below minimum for ${token} (${minAmount[token]})`,
        code: z.ZodIssueCode.custom,
      })
    }

    if (token in maxAmount && num > maxAmount[token]) {
      ctx.addIssue({
        path: ['transferAmount'],
        message: `Grant amount is above maximum for ${token} (${maxAmount[token]})`,
        code: z.ZodIssueCode.custom,
      })
    }
  })
export type GrantProposal = z.infer<typeof GrantProposalSchema>
