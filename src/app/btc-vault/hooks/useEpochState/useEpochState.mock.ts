import { useQuery } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'
import { toEpochDisplay } from '../../services/ui/mappers'

/**
 * Fetches the current epoch state and returns a display object with status summary.
 * @returns React Query result containing {@link EpochDisplay}
 */
export function useEpochStateMock() {
  const adapter = useMockBtcVaultAdapter()

  return useQuery({
    queryKey: ['btc-vault', 'epoch'],
    queryFn: async () => {
      const raw = await adapter.getEpochState()
      return toEpochDisplay(raw)
    },
  })
}
