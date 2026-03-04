import { useAccount } from 'wagmi'

import type { EligibilityStatus, PauseState } from '../../services/types'
import {
  ELIGIBILITY_REASON_DISCONNECTED,
  ELIGIBILITY_REASON_NOT_AUTHORIZED,
} from '../../services/ui/eligibilityReasons'
import { toActionEligibility } from '../../services/ui/mappers'

// Re-export for banners and tests
export {
  ELIGIBILITY_REASON_DEPOSITS_PAUSED,
  ELIGIBILITY_REASON_DISCONNECTED,
  ELIGIBILITY_REASON_ELIGIBLE,
  ELIGIBILITY_REASON_LOADING,
  ELIGIBILITY_REASON_NOT_AUTHORIZED,
  ELIGIBILITY_REASON_WITHDRAWALS_PAUSED,
} from '../../services/ui/eligibilityReasons'

// --- Mock data (replace with real contract/KYB once deployed) ---

const MOCK_PAUSE: PauseState = {
  deposits: 'active',
  withdrawals: 'active',
}

const MOCK_ELIGIBILITY: EligibilityStatus = {
  eligible: false,
  reason: ELIGIBILITY_REASON_NOT_AUTHORIZED,
}

/**
 * Answers the question: **Can the user use the vault?**
 *
 * Determines whether the current user is eligible to interact with the BTC vault
 * (connected + KYB approved + deposits not paused + withdrawals not paused).
 * Returns isEligible and a reason string (one of the ELIGIBILITY_REASON_* constants).
 *
 * This is a mock hook for now — isLoading is always false. Once the contract is
 * deployed and KYB is figured out, the real implementation will replace it.
 */
export function useActionEligibility(): {
  isEligible: boolean
  reason: string
  isLoading: boolean
} {
  const { address, isConnected } = useAccount()

  if (!address || !isConnected) {
    return {
      isEligible: false,
      reason: ELIGIBILITY_REASON_DISCONNECTED,
      isLoading: false,
    }
  }

  const { isEligible, reason } = toActionEligibility(MOCK_PAUSE, MOCK_ELIGIBILITY)

  return { isEligible, reason, isLoading: false }
}
