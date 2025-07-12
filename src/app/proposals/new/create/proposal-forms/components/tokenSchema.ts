import { z } from 'zod'

// list of available tokens
export const TOKENS = ['RIF', 'rBTC'] as const
export type TokenType = (typeof TOKENS)[number]

// Base schema for token form field
export const TokenFieldsSchema = z.object({
  token: z.enum(TOKENS, {
    errorMap: () => ({ message: 'Please select a token' }),
  }),
  transferAmount: z.string().trim().nonempty({ message: 'Please enter transfer amount' }),
})

export const TokenSchema = TokenFieldsSchema

export type TokenFormData = z.infer<typeof TokenFieldsSchema>
