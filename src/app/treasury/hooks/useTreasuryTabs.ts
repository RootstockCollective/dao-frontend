import { useMemo } from 'react'
import { useTreasuryContext } from '@/app/treasury/contexts/TreasuryContext'
import { treasuryContracts } from '@/lib/contracts'
import { TreasurySection, TreasuryTabKey } from '../types'

/**
 * useTreasuryTabs is a hook that organizes treasury bucket data into categorized tab structures.
 * It retrieves data from TreasuryContext and maps it to predefined categories (Grants, Growth, General).
 * Each category contains relevant RIF and RBTC buckets along with their associated contract addresses.
 */
export function useTreasuryTabs() {
  const { buckets } = useTreasuryContext()

  return useMemo<Record<TreasuryTabKey, TreasurySection>>(
    () => ({
      Grants: {
        description: '',
        categories: {
          Grants: {
            buckets: [
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
            buckets: [
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
      },
      Growth: {
        description: '',
        categories: {
          Total: {
            buckets: [
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
            buckets: [
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
      },
      General: {
        description: '',
        categories: {
          '': {
            buckets: [
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
      },
    }),
    [buckets],
  )
}
