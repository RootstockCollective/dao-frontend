import { useQuery } from '@tanstack/react-query'
import { toUserPositionDisplay } from '../../services/ui/mappers'
import type { UserPosition } from '../../services/types'

const ONE_BTC = 10n ** 18n

const MOCK_POSITION: UserPosition = {
  rbtcBalance: 2n * ONE_BTC,
  vaultTokens: 5n * ONE_BTC,
  positionValue: (51n * ONE_BTC) / 10n,
  percentOfVault: 10.2,
}

const EMPTY_POSITION: UserPosition = {
  rbtcBalance: 0n,
  vaultTokens: 0n,
  positionValue: 0n,
  percentOfVault: 0,
}

export function useUserPosition(address: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'user-position', address],
    queryFn: () => toUserPositionDisplay(address ? MOCK_POSITION : EMPTY_POSITION),
    enabled: !!address,
    staleTime: Infinity,
  })
}
