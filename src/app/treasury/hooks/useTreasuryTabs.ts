import { useMemo } from 'react'
import { useTreasuryContext } from '@/app/treasury/contexts/TreasuryContext'
import { treasuryContracts } from '@/lib/contracts'
import { Bucket, TreasurySection, TreasuryTabKey } from '../types'

/**
 * useTreasuryTabs is a hook that organizes treasury bucket data into categorized tab structures.
 * It retrieves data from TreasuryContext and maps it to predefined categories (Grants, Growth, General).
 * Each category contains relevant RIF and RBTC buckets along with their associated contract addresses.
 */
export function useTreasuryTabs() {
  const { buckets } = useTreasuryContext()

  const createBucketList = (bucketGroup: Bucket | undefined) => [
    {
      title: 'RIF',
      bucket: bucketGroup?.RIF,
    },
    {
      title: 'USDRIF',
      bucket: bucketGroup?.USDRIF,
    },
    {
      title: 'RBTC',
      bucket: bucketGroup?.RBTC,
    },
  ]

  return useMemo<Record<TreasuryTabKey, TreasurySection>>(
    () => ({
      Grants: {
        description: '', // TODO: add description
        categories: {
          Grants: {
            buckets: createBucketList(buckets.GRANTS),
            address: treasuryContracts.GRANTS.address,
          },
          Active: {
            buckets: createBucketList(buckets.GRANTS_ACTIVE),
            address: treasuryContracts.GRANTS_ACTIVE.address,
          },
        },
      },
      Growth: {
        description: '', // TODO: add description
        categories: {
          Total: {
            buckets: createBucketList(buckets.GROWTH),
            address: treasuryContracts.GROWTH.address,
          },
          Rewards: {
            buckets: createBucketList(buckets.GROWTH_REWARDS),
            address: treasuryContracts.GROWTH_REWARDS.address,
          },
        },
      },
      General: {
        description: '', // TODO: add description
        categories: {
          '': {
            buckets: createBucketList(buckets.GENERAL),
            address: treasuryContracts.GENERAL.address,
          },
        },
      },
    }),
    [buckets],
  )
}
