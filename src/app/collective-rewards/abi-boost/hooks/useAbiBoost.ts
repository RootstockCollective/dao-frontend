import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'
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

/** The boost flow shows amounts in RIF only, so fiat figures stay hidden while the flag is on. */
export const useShowsFiatAmounts = (): boolean => !useIsAbiBoostEnabled()

/** Where the app lets a backer pick Builders to back. */
export const BACK_BUILDERS_PATH = '/builders'

export const useGoToBackBuilders = (): (() => void) => {
  const router = useRouter()
  return useCallback(() => router.push(BACK_BUILDERS_PATH), [router])
}

export interface AbiBoostPositionState {
  status: AbiBoostStatus
  /** stRIF balance, in wei. */
  stRifBalance: bigint
  /** On-chain stRIF backing Builders, in wei. */
  backing: bigint
  /**
   * Both reads have landed without error. Until then the figures are placeholders, and showing a
   * status from them would tell an active wallet it isn't boosted.
   */
  isReady: boolean
}

/**
 * The connected wallet's standing in the boost programme, from its stRIF balance and its on-chain
 * backing. Both reads share their query with the allocations context, so this adds no requests.
 */
export const useAbiBoostPosition = (): AbiBoostPositionState => {
  const { address } = useAccount()
  const { data: stRifBalance, error: balanceError } = useGetVotingPower()
  // No placeholder here: a 0n stand-in reads as a real "not backing" answer while the query loads
  const { data: backing, error: backingError } = useReadBackersManager(
    {
      functionName: 'backerTotalAllocation',
      args: [address ?? zeroAddress],
    },
    { enabled: !!address },
  )

  return useMemo(() => {
    const position = { stRifBalance: stRifBalance ?? 0n, backing: backing ?? 0n }
    return {
      ...position,
      status: getAbiBoostStatus(position),
      isReady:
        !!address && stRifBalance !== undefined && backing !== undefined && !balanceError && !backingError,
    }
  }, [address, stRifBalance, backing, balanceError, backingError])
}
