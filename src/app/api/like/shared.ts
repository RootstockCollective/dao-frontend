import { z } from 'zod'

export const ProposalIdSchema = z
  .string()
  .min(1, 'proposalId is required')
  .refine(val => {
    try {
      BigInt(val)
      return true
    } catch {
      return false
    }
  }, 'proposalId must be a valid numeric string')

export function bigIntToBuffer(value: string): Uint8Array<ArrayBuffer> {
  let hex = BigInt(value).toString(16)
  hex = hex.padStart(64, '0')
  return new Uint8Array(Buffer.from(hex, 'hex'))
}
