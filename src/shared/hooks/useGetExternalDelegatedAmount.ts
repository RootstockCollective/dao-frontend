import { useCallback, useEffect, useState } from 'react'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

import { useGetDelegates } from '@/app/user/Delegation/hooks/useGetDelegates'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { AVERAGE_BLOCKTIME, STRIF_ADDRESS } from '@/lib/constants'
import { getEnsDomainName } from '@/lib/rns'

/**
 * Custom hook to calculate the amount of voting power delegated to an address by other users.
 * Excludes self-delegated voting power from the calculation.
 *
 * @param {Address|undefined} address - The address to check delegations for
 * @returns {Object} Object containing the external delegated amount and loading state
 * @property {bigint} amount - The amount of voting power delegated by other users
 * @property {boolean} isLoading - True if any dependent data is still loading
 *
 * @example
 * ```tsx
 * const externalDelegations = useGetExternalDelegatedAmount(userAddress)
 * ```
 *
 * @remarks
 * Returns:
 * - All voting power if user hasn't self-delegated but has voting power (full external delegation)
 * - Difference between voting power and balance if self-delegated (partial external delegation)
 * - 0n if no external delegations exist
 */
export const useGetExternalDelegatedAmount = (address: Address | undefined) => {
  const {
    delegateeAddress,
    delegationStatus,
    isLoading: isDelegateLoading,
    refetch: refetchDelegate,
  } = useGetDelegates(address)

  const [delegateeRns, setDelegateeRns] = useState<string | undefined>()

  useEffect(() => {
    if (delegateeAddress) {
      getEnsDomainName(delegateeAddress).then(ens => setDelegateeRns(ens))
    }
  }, [delegateeAddress])
  const {
    data: votingPower,
    isLoading: isVotingPowerLoading,
    refetch: refetchVotingPower,
  } = useReadContract(
    address && {
      abi: StRIFTokenAbi,
      address: STRIF_ADDRESS,
      functionName: 'getVotes',
      args: [address],
      query: {
        refetchInterval: AVERAGE_BLOCKTIME,
      },
    },
  )

  const { data: delegateeVotingPower } = useReadContract(
    delegateeAddress && {
      abi: StRIFTokenAbi,
      address: STRIF_ADDRESS,
      functionName: 'getVotes',
      args: [delegateeAddress],
      query: {
        refetchInterval: AVERAGE_BLOCKTIME,
      },
    },
  )

  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useReadContract(
    address && {
      abi: StRIFTokenAbi,
      address: STRIF_ADDRESS,
      functionName: 'balanceOf',
      args: [address],
      query: {
        refetchInterval: AVERAGE_BLOCKTIME,
      },
    },
  )

  const isLoading = isDelegateLoading || isVotingPowerLoading || isBalanceLoading
  const isAccountRead = delegationStatus !== undefined && votingPower !== undefined && balance !== undefined

  const didIDelegateToMyself = delegationStatus === 'self'
  const doIHaveVotingPower = (votingPower || 0n) > 0n

  let amountDelegatedToMe = 0n
  const own = balance || 0n
  const delegated = delegationStatus === 'other' ? own : 0n

  if (!didIDelegateToMyself && doIHaveVotingPower) {
    amountDelegatedToMe = votingPower || 0n
  }

  if (didIDelegateToMyself && votingPower && votingPower > own) {
    amountDelegatedToMe = votingPower - own
  }

  const refetch = useCallback(async () => {
    await Promise.all([refetchVotingPower(), refetchBalance(), refetchDelegate()])
  }, [refetchVotingPower, refetchBalance, refetchDelegate])

  return {
    amount: amountDelegatedToMe,
    isLoading,
    isAccountRead,
    delegationStatus,
    delegated,
    own,
    available: votingPower ?? (didIDelegateToMyself ? own : 0n),
    delegateeAddress,
    refetch,
    delegateeVotingPower,
    delegateeRns,
  }
}
