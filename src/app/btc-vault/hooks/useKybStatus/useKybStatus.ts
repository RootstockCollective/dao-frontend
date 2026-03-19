'use client'

import { useCallback, useState } from 'react'

import type { KybStatus, UseKybStatusResult } from '../../types/kyb'

const MOCK_REJECTION_REASON = 'Document verification could not be completed.'

/**
 * KYB status hook for BTC Vault eligibility banners.
 * Mock: default status is 'none' (No KYB). 1st submit → rejected, 2nd submit → passed. Reload resets.
 * Replace with real API (e.g. GET /api/kyb/status, submitKyb → POST) later without changing UI contract.
 *
 * @returns UseKybStatusResult — status, rejectionReason, submitKyb
 */
export function useKybStatus(): UseKybStatusResult {
  const [submitCount, setSubmitCount] = useState(0)

  const status: KybStatus = submitCount === 0 ? 'none' : submitCount === 1 ? 'rejected' : 'passed'
  const rejectionReason = status === 'rejected' ? MOCK_REJECTION_REASON : undefined

  const submitKyb = useCallback(() => {
    setSubmitCount(c => c + 1)
  }, [])

  return {
    status,
    rejectionReason,
    submitKyb,
  }
}
