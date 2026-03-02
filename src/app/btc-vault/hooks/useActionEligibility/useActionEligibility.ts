import { useQuery } from '@tanstack/react-query'
import { toActionEligibility } from '../../services/ui/mappers'
import type { PauseState, EligibilityStatus, VaultRequest } from '../../services/types'

const MOCK_PAUSE: PauseState = {
  deposits: 'active',
  withdrawals: 'active',
}

const MOCK_ELIGIBILITY: EligibilityStatus = {
  eligible: true,
  reason: '',
}

const MOCK_ACTIVE_REQUESTS: VaultRequest[] = []

export function useActionEligibility(address: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'action-eligibility', address],
    queryFn: () => toActionEligibility(MOCK_PAUSE, MOCK_ELIGIBILITY, MOCK_ACTIVE_REQUESTS),
    enabled: !!address,
    staleTime: Infinity,
  })
}
