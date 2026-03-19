'use client'

import { useSearchParams } from 'next/navigation'

import type { KybStatus, KybStatusResult } from '../../types/kyb'

const VALID_KYB_PARAMS: KybStatus[] = ['none', 'rejected', 'passed']

const DEFAULT_KYB_STATUS: KybStatus = 'none'

const MOCK_REJECTION_REASON = 'Document verification could not be completed.'

function parseKybParam(value: string | null): KybStatus | null {
  if (value === null || value === '') return null
  const normalized = value.toLowerCase().trim()
  return VALID_KYB_PARAMS.includes(normalized as KybStatus) ? (normalized as KybStatus) : null
}

/**
 * Mock KYB status hook for BTC Vault eligibility banners.
 * Reads query param `kyb` (?kyb=none|rejected|passed) for deterministic testing;
 * when missing or invalid, returns default status 'none'.
 * Replace with real API (e.g. GET /api/kyb/status) later without changing UI contract.
 *
 * @returns KybStatusResult — status and optional rejectionReason when status is 'rejected'
 */
export function useKybStatus(): KybStatusResult {
  const searchParams = useSearchParams()
  const param = searchParams == null ? null : searchParams.get('kyb')
  const status = parseKybParam(param) ?? DEFAULT_KYB_STATUS

  const result: KybStatusResult = { status }
  if (status === 'rejected') {
    result.rejectionReason = MOCK_REJECTION_REASON
  }
  return result
}
