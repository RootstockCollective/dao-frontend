'use client'

import { useMemo } from 'react'

import { rbtcVault } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

/** Args match PauseCard toggle: pause when chain reports active (`!withdrawalsPaused`). */
export function usePauseVaultWithdrawals(withdrawalsPaused: boolean) {
  const config = useMemo(
    () => ({
      ...rbtcVault,
      functionName: 'setRedeemRequestsPaused' as const,
      args: [!withdrawalsPaused] as const,
    }),
    [withdrawalsPaused],
  )

  return useContractWrite(config)
}
