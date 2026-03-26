'use client'

import { useWhitelistCheck } from '@/app/btc-vault/hooks/useWhitelistCheck'

import type { KybStatus, UseKybStatusResult } from '../../types/kyb'

/**
 * KYB status hook for BTC Vault eligibility banners.
 * Derives status from the on-chain whitelist check (PermissionsManager.hasRole).
 * Whitelisted users are treated as KYB-passed; non-whitelisted users see the KYB banner.
 *
 * TODO: Once the off-chain KYB process is defined, replace this on-chain check with the
 * real KYB API (e.g. GET /api/kyb/status) and create a new banner to reflect the actual
 * KYB lifecycle (none → pending → rejected → passed).
 *
 * @returns UseKybStatusResult — status, rejectionReason
 */
export function useKybStatus(): UseKybStatusResult {
  const { isWhitelisted, isLoading } = useWhitelistCheck()

  if (isLoading) {
    return { status: 'none' }
  }

  const status: KybStatus = isWhitelisted ? 'passed' : 'none'

  return { status }
}
