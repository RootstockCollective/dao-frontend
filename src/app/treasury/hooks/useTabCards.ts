import { useMemo } from 'react'
import { Address } from 'viem'
import { useTreasuryContext } from '@/app/treasury/TreasuryContext'
import { treasuryContracts } from '@/lib/contracts'

interface Card {
  title: string
  bucket?: { amount: string; fiatAmount: string }
  contract?: Address
}

/**
 * useTabCards is a hook that organizes treasury bucket data into categorized tab structures.
 * It retrieves data from TreasuryContext and maps it to predefined categories (Grants, Growth, General).
 * Each category contains relevant RIF and RBTC buckets along with their associated contract addresses.
 */
export function useTabCards() {
  const { buckets } = useTreasuryContext()

  return useMemo<Record<'Grants' | 'Growth' | 'General', Card[]>>(
    () => ({
      Grants: [
        {
          title: 'RIF',
          bucket: buckets.GRANTS?.RIF,
          contract: treasuryContracts.GRANTS.address,
        },
        {
          title: 'Active RIF',
          bucket: buckets.GRANTS_ACTIVE?.RIF,
          contract: treasuryContracts.GRANTS_ACTIVE.address,
        },
        {
          title: 'RBTC',
          bucket: buckets.GRANTS?.RBTC,
        },
        {
          title: 'Active RBTC',
          bucket: buckets.GRANTS_ACTIVE?.RBTC,
        },
      ],
      Growth: [
        {
          title: 'RIF',
          bucket: buckets.GROWTH?.RIF,
          contract: treasuryContracts.GROWTH.address,
        },
        {
          title: 'Rewards RIF',
          bucket: buckets.GROWTH_REWARDS?.RIF,
          contract: treasuryContracts.GROWTH_REWARDS.address,
        },
        {
          title: 'RBTC',
          bucket: buckets.GROWTH?.RBTC,
        },
        {
          title: 'Rewards RBTC',
          bucket: buckets.GROWTH_REWARDS?.RBTC,
        },
      ],
      General: [
        {
          title: 'RIF',
          bucket: buckets.GENERAL?.RIF,
          contract: treasuryContracts.GENERAL.address,
        },
        {
          title: 'RBTC',
          bucket: buckets.GENERAL?.RBTC,
        },
      ],
    }),
    [buckets],
  )
}
