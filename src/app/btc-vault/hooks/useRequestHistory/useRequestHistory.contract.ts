import { useQuery } from '@tanstack/react-query'
import type { PaginationParams } from '../../services/types'

/**
 * Placeholder for contract-based request history.
 * Will be implemented when on-chain contracts are deployed.
 */
export function useRequestHistoryContract(address: string | undefined, params: PaginationParams) {
  return useQuery({
    queryKey: ['btc-vault', 'history', address, params],
    queryFn: () => {
      throw new Error('Contract not implemented')
    },
    enabled: !!address,
  })
}
