import { isAddress } from 'viem'
import { z } from 'zod'

function isValidRecipientAddress(value: string): boolean {
  return isAddress(value, { strict: false })
}

export const recipientAddressSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a valid address')
  .refine(isValidRecipientAddress, 'Please enter a valid address')

export const recipientInfoFormSchema = z.object({
  recipientAddress: recipientAddressSchema,
})

export type RecipientInfoForm = z.infer<typeof recipientInfoFormSchema>
