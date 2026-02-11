/**
 * Converts a proposal ID (BigInt string) to a 32-byte Buffer for BYTEA storage.
 * Governor proposal IDs are uint256; PostgreSQL BYTEA requires consistent length.
 *
 * @param value - Proposal ID as string (e.g. "123" or "0x...")
 * @returns 32-byte Buffer (64 hex chars padded)
 */
export function bigIntToBuffer(value: string): Buffer {
  const hex = BigInt(value).toString(16).padStart(64, '0')
  return Buffer.from(hex, 'hex')
}
