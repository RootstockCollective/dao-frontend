import { useQuery } from '@tanstack/react-query'

import { WeiPerEther } from '@/lib/constants'

import type { UserPosition } from '../../services/types'
import { toUserPositionDisplay } from '../../services/ui/mappers'

const MOCK_POSITION: UserPosition = {
  rbtcBalance: 2n * WeiPerEther,
  vaultTokens: 5n * WeiPerEther,
  positionValue: (51n * WeiPerEther) / 10n,
  percentOfVault: 10.2,
  totalDepositedPrincipal: 5n * WeiPerEther,
}

const EMPTY_POSITION: UserPosition = {
  rbtcBalance: 0n,
  vaultTokens: 0n,
  positionValue: 0n,
  percentOfVault: 0,
  totalDepositedPrincipal: 0n,
}

export function useUserPosition(address: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'user-position', address],
    queryFn: () => toUserPositionDisplay(address ? MOCK_POSITION : EMPTY_POSITION),
    enabled: !!address,
    staleTime: Infinity,
  })
}
