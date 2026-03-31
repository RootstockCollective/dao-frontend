import { useMemo } from 'react'

import { rbtcVault } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

/**
 * Manager CTA: close current epoch with updated reported off-chain assets
 * and run funding processing in a single transaction.
 */
export const useUpdateNav = (reportedOffchainAssetsWei: bigint) => {
  const config = useMemo(
    () => ({
      ...rbtcVault,
      functionName: 'reportOffchainAssetsAndProcessFunding' as const,
      args: [reportedOffchainAssetsWei] as const,
    }),
    [reportedOffchainAssetsWei],
  )

  return useContractWrite(config)
}
