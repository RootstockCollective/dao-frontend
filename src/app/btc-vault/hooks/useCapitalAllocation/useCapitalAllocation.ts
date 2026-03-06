import { useQuery } from '@tanstack/react-query'

import { RBTC } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'

import type { CapitalAllocation } from '../../services/types'
import { toCapitalAllocationDisplay } from '../../services/ui/mappers'

const ONE_BTC = 10n ** 18n

const MOCK_CAPITAL_ALLOCATION: CapitalAllocation = {
  categories: [
    { label: 'Deployed capital', amount: (ONE_BTC * 52n) / 100n },
    { label: 'Liquidity reserve', amount: (ONE_BTC * 26n) / 100n },
    { label: 'Unallocated capital', amount: (ONE_BTC * 26n) / 100n },
  ],
  totalCapital: (ONE_BTC * 104n) / 100n,
}

export function useCapitalAllocation() {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  return useQuery({
    queryKey: ['btc-vault', 'capital-allocation', rbtcPrice],
    queryFn: () => toCapitalAllocationDisplay(MOCK_CAPITAL_ALLOCATION, rbtcPrice),
    staleTime: Infinity,
  })
}
