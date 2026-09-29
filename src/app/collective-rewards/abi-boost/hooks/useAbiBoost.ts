import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { useGetVotingPower } from '@/app/collective-rewards/allocations/hooks'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'
import { useReadBackersManager } from '@/shared/hooks/contracts'

import { AbiBoostStatus, getAbiBoostStatus } from '../abiBoost.utils'

export const useIsAbiBoostEnabled = (): boolean => {
  const { flags } = useFeatureFlags()
  return !!flags.abi_boost
}

export interface AbiBoostPositionState {
  status: AbiBoostStatus
  /** stRIF balance, in wei. */
  stRifBalance: bigint
  /** On-chain stRIF backing Builders, in wei. */
  backing: bigint
  isLoading: boolean
}

/**
 * The connected wallet's standing in the boost programme, from its stRIF balance and its on-chain
 * backing. Both reads share their query with the allocations context, so this adds no requests.
 */
export const useAbiBoostPosition = (): AbiBoostPositionState => {
  const { address } = useAccount()
  const { data: stRifBalance, isLoading: isBalanceLoading } = useGetVotingPower()
  const { data: backing, isLoading: isBackingLoading } = useReadBackersManager(
    {
      functionName: 'backerTotalAllocation',
      args: [address ?? zeroAddress],
    },
    {
      placeholderData: 0n,
      enabled: !!address,
    },
  )

  return useMemo(() => {
    const position = { stRifBalance: stRifBalance ?? 0n, backing: backing ?? 0n }
    return {
      ...position,
      status: getAbiBoostStatus(position),
      isLoading: !!address && (isBalanceLoading || isBackingLoading),
    }
  }, [address, stRifBalance, backing, isBalanceLoading, isBackingLoading])
}
