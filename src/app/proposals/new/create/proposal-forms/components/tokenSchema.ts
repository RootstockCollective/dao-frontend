import { z } from 'zod'

// list of available tokens
export const TOKENS = ['RIF', 'rBTC'] as const
export type TokenType = (typeof TOKENS)[number]

// Base schema for token form field
export const TokenFieldsSchema = z.object({
  token: z.enum(TOKENS),
  transferAmount: z
    .string()
    .trim()
    .refine(val => !isNaN(Number(val)), {
      message: 'Amount must be a number',
    }),
})

export const TokenSchema = TokenFieldsSchema

export type TokenFormData = z.infer<typeof TokenFieldsSchema>
