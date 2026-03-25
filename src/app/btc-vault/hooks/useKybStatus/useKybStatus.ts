'use client'

import { useState } from 'react'

import type { KybStatus, UseKybStatusResult } from '../../types/kyb'

const MOCK_REJECTION_REASON = 'Document verification could not be completed.'

/**
 * KYB status hook for BTC Vault eligibility banners.
 * Mock: default status is 'none' (No KYB). Reload resets.
 * Replace with real API (e.g. GET /api/kyb/status) later without changing UI contract.
 *
 * @returns UseKybStatusResult — status, rejectionReason
 */
export function useKybStatus(): UseKybStatusResult {
  const [submitCount] = useState(0)

  const status: KybStatus = submitCount === 0 ? 'none' : submitCount === 1 ? 'rejected' : 'passed'
  const rejectionReason = status === 'rejected' ? MOCK_REJECTION_REASON : undefined

  return {
    status,
    rejectionReason,
  }
}
