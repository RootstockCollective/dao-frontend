import { getAddress, isAddress } from 'viem'
import { z } from 'zod'

import { isRnsDomain } from '@/lib/rns'

export const btcAddWhitelistSchema = z
  .object({
    walletAddressInput: z.string().trim().min(5, 'Wallet address or RNS is required'),
    walletAddress: z.string().trim(),
    walletAddressError: z.string().optional(),
    walletAddressRNS: z
      .string()
      .trim()
      .optional()
      .refine(value => !value || isRnsDomain(value), 'Invalid RNS domain'),
  })
  .superRefine((data, ctx) => {
    const { walletAddressInput, walletAddress, walletAddressError } = data

    if (walletAddressError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: walletAddressError,
        path: ['walletAddressInput'],
      })
      return
    }

    if (walletAddressInput.length >= 5 && !isAddress(walletAddress, { strict: false })) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid address or RNS domain',
        path: ['walletAddressInput'],
      })
    }
  })
  .transform(data => ({
    ...data,
    walletAddress: isAddress(data.walletAddress, { strict: false })
      ? getAddress(data.walletAddress)
      : data.walletAddress,
  }))

export type BTCAddWhitelistForm = z.infer<typeof btcAddWhitelistSchema>
