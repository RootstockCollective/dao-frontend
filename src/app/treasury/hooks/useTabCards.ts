import { useMemo } from 'react'
import { Address } from 'viem'
import { useTreasuryContext } from '@/app/treasury/TreasuryContext'
import { treasuryContracts } from '@/lib/contracts'

interface Asset {
  title: string
  bucket?: { amount: string; fiatAmount: string }
}

interface Card {
  assets: Asset[]
  address: Address
}

/**
 * useTabCards is a hook that organizes treasury bucket data into categorized tab structures.
 * It retrieves data from TreasuryContext and maps it to predefined categories (Grants, Growth, General).
 * Each category contains relevant RIF and RBTC buckets along with their associated contract addresses.
 */
export function useTabCards() {
  const { buckets } = useTreasuryContext()

  return useMemo<Record<'Grants' | 'Growth' | 'General', { [key: string]: Card }>>(
    () => ({
      Grants: {
        Grants: {
          assets: [
            {
              title: 'RIF',
              bucket: buckets.GRANTS?.RIF,
            },
            {
              title: 'RBTC',
              bucket: buckets.GRANTS?.RBTC,
            },
          ],
          address: treasuryContracts.GRANTS.address,
        },
        Active: {
          assets: [
            {
              title: 'RIF',
              bucket: buckets.GRANTS_ACTIVE?.RIF,
            },
            {
              title: 'RBTC',
              bucket: buckets.GRANTS_ACTIVE?.RBTC,
            },
          ],
          address: treasuryContracts.GRANTS_ACTIVE.address,
        },
      },
      Growth: {
        Total: {
          assets: [
            {
              title: 'RIF',
              bucket: buckets.GROWTH?.RIF,
            },
            {
              title: 'RBTC',
              bucket: buckets.GROWTH?.RBTC,
            },
          ],
          address: treasuryContracts.GROWTH.address,
        },
        Rewards: {
          assets: [
            {
              title: 'RIF',
              bucket: buckets.GROWTH_REWARDS?.RIF,
            },
            {
              title: 'RBTC',
              bucket: buckets.GROWTH_REWARDS?.RBTC,
            },
          ],
          address: treasuryContracts.GROWTH_REWARDS.address,
        },
      },
      General: {
        '': {
          assets: [
            {
              title: 'RIF',
              bucket: buckets.GENERAL?.RIF,
            },

            {
              title: 'RBTC',
              bucket: buckets.GENERAL?.RBTC,
            },
          ],
          address: treasuryContracts.GENERAL.address,
        },
      },
    }),
    [buckets],
  )
}
