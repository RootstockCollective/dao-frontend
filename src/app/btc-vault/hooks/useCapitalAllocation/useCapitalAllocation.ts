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
  wallets: [
    {
      label: 'Fordefi 1',
      trackingPlatform: 'Nimbus',
      trackingUrl: 'https://app.nimbus.io',
      amount: (ONE_BTC * 999_99999n) / 100_000n,
      percentOfTotal: 96.49,
    },
    {
      label: 'Fordefi 2',
      trackingPlatform: 'Nimbus',
      trackingUrl: 'https://app.nimbus.io',
      amount: (ONE_BTC * 9_99999n) / 1_000_000n,
      percentOfTotal: 0.5,
    },
    {
      label: 'Fordefi 3',
      trackingPlatform: 'Suivision',
      trackingUrl: 'https://suivision.xyz',
      amount: (ONE_BTC * 9_99999n) / 1_000_000n,
      percentOfTotal: 0.5,
    },
    {
      label: 'Fordefi 4',
      trackingPlatform: 'Nimbus',
      trackingUrl: 'https://app.nimbus.io',
      amount: (ONE_BTC * 9_99999n) / 1_000_000n,
      percentOfTotal: 0.5,
    },
    {
      label: 'Fordefi 5',
      trackingPlatform: 'Nimbus',
      trackingUrl: 'https://app.nimbus.io',
      amount: (ONE_BTC * 9_99999n) / 1_000_000n,
      percentOfTotal: 0.5,
    },
    {
      label: 'Fordefi 6',
      trackingPlatform: 'Nimbus',
      trackingUrl: 'https://app.nimbus.io',
      amount: (ONE_BTC * 9_99999n) / 1_000_000n,
      percentOfTotal: 0.5,
    },
    {
      label: 'Fordefi 7',
      trackingPlatform: 'Nimbus',
      trackingUrl: 'https://app.nimbus.io',
      amount: (ONE_BTC * 9_99999n) / 1_000_000n,
      percentOfTotal: 0.5,
    },
    {
      label: 'Fordefi 8',
      trackingPlatform: 'Nimbus',
      trackingUrl: 'https://app.nimbus.io',
      amount: (ONE_BTC * 9_99999n) / 1_000_000n,
      percentOfTotal: 0.51,
    },
  ],
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
