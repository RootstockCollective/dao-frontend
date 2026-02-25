import { useQuery } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'
import { toActionEligibility } from '../../services/ui/mappers'

/**
 * Fetches and consolidates pause state, user eligibility, and active requests
 * to determine whether deposit/withdrawal actions are available.
 * Query is disabled when address is undefined.
 * @param address - User's wallet address, or undefined if not connected
 * @returns React Query result containing {@link ActionEligibility}
 */
export function useActionEligibilityMock(address: string | undefined) {
  const adapter = useMockBtcVaultAdapter()

  return useQuery({
    queryKey: ['btc-vault', 'action-eligibility', address],
    queryFn: async () => {
      const [pause, eligibility, activeRequests] = await Promise.all([
        adapter.getPauseState(),
        adapter.getEligibility(address!),
        adapter.getActiveRequests(address!),
      ])
      return toActionEligibility(pause, eligibility, activeRequests)
    },
    enabled: !!address,
  })
}
