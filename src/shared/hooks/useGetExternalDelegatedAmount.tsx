import { Address } from 'viem'
import { useGetDelegates } from '@/app/user/Delegation/hooks/useGetDelegates'
import { useAccount, useReadContract } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { AVERAGE_BLOCKTIME, STRIF_ADDRESS } from '@/lib/constants'

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
  const { address: ownAddress } = useAccount()
  const {
    delegateeAddress,
    isLoading: isDelegateLoading,
    refetch: refetchDelegate,
  } = useGetDelegates(address)

  const {
    data: votingPower,
    isLoading: isVotingPowerLoading,
    refetch: refetchVotingPower,
  } = useReadContract(
    ownAddress && {
      abi: StRIFTokenAbi,
      address: STRIF_ADDRESS,
      functionName: 'getVotes',
      args: [ownAddress],
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
    ownAddress && {
      abi: StRIFTokenAbi,
      address: STRIF_ADDRESS,
      functionName: 'balanceOf',
      args: [ownAddress],
      query: {
        refetchInterval: AVERAGE_BLOCKTIME,
      },
    },
  )

  const isLoading = isDelegateLoading || isVotingPowerLoading || isBalanceLoading

  const didIDelegateToMyself = ownAddress === delegateeAddress
  const doIHaveVotingPower = (votingPower || 0n) > 0n

  let amountDelegatedToMe = 0n
  let delegated = 0n
  let own = balance || 0n

  if (!didIDelegateToMyself) {
    delegated = own || 0n
  }

  if (!didIDelegateToMyself && doIHaveVotingPower) {
    amountDelegatedToMe = votingPower || 0n
  }

  if (didIDelegateToMyself && votingPower && balance) {
    if (votingPower > balance) {
      amountDelegatedToMe = votingPower - balance
    }
  }

  const refetch = () => {
    refetchVotingPower()
    refetchBalance()
    refetchDelegate()
  }

  return {
    amount: amountDelegatedToMe,
    isLoading,
    didIDelegateToMyself,
    delegated,
    own,
    available: amountDelegatedToMe + (own - delegated),
    delegateeAddress,
    refetch,
  }
}
