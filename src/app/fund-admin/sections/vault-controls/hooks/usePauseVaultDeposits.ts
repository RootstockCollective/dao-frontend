'use client'

import { useMemo } from 'react'

import { rbtcVault } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

/** Args match PauseCard toggle: pause when chain reports active (`!depositsPaused`). */
export function usePauseVaultDeposits(depositsPaused: boolean) {
  const config = useMemo(
    () => ({
      ...rbtcVault,
      functionName: 'setDepositRequestsPaused' as const,
      args: [!depositsPaused] as const,
    }),
    [depositsPaused],
  )

  return useContractWrite(config)
}
