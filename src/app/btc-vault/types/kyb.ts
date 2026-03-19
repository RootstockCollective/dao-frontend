/**
 * KYB (Know Your Business) status for BTC Vault eligibility.
 * Used by useKybStatus and eligibility banner UI; interface allows swapping mock for real API later.
 */
export type KybStatus = 'none' | 'rejected' | 'passed'

export interface KybStatusResult {
  status: KybStatus
  /** Present when status is 'rejected'; reason from provider or mock. */
  rejectionReason?: string
}
