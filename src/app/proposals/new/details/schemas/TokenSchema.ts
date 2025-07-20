import { z } from 'zod'

// list of available tokens
export const TOKENS = ['RIF', 'rBTC'] as const
export type TokenType = (typeof TOKENS)[number]

// Constants for token field limits
export const TOKEN_FIELD_LIMITS = {
  transferAmount: { maxLength: 20 }, // Reasonable limit for number input
} as const

// Base schema for token form field
export const TokenFieldsSchema = z.object({
  token: z.enum(TOKENS, {
    errorMap: () => ({ message: 'Please select a token' }),
  }),
  transferAmount: z
    .string()
    .trim()
    .max(TOKEN_FIELD_LIMITS.transferAmount.maxLength, {
      message: `Amount is too long (max ${TOKEN_FIELD_LIMITS.transferAmount.maxLength} characters)`,
    })
    .nonempty({ message: 'Please enter transfer amount' }),
})

export const TokenSchema = TokenFieldsSchema

export type TokenFormData = z.infer<typeof TokenFieldsSchema>
