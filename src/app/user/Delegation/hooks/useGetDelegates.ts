import { Address, isAddressEqual, zeroAddress } from 'viem'
import { useReadContract } from 'wagmi'

import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'

const stRifContract = {
  abi: StRIFTokenAbi,
  address: tokenContracts.stRIF,
}

/** Where an account's voting power goes: to itself, to someone else, or nowhere because it never delegated */
export type DelegationStatus = 'self' | 'other' | 'none'

/** The account's voting power is not delegated to someone else: it stays with the account, or goes nowhere */
export const hasNoOtherDelegatee = (status: DelegationStatus | undefined) =>
  status === 'self' || status === 'none'

const getDelegationStatus = (account: Address, delegatee: Address): DelegationStatus => {
  // stRIF reports the zero address for an account that has never delegated
  if (delegatee === zeroAddress) return 'none'
  return isAddressEqual(delegatee, account) ? 'self' : 'other'
}

export const useGetDelegates = (address: Address | undefined) => {
  const { data, isLoading, refetch } = useReadContract(
    address && {
      ...stRifContract,
      functionName: 'delegates',
      args: [address],
      query: {
        refetchInterval: AVERAGE_BLOCKTIME,
      },
    },
  )

  // Undefined until the delegatee has been read
  const delegationStatus = address && data ? getDelegationStatus(address, data) : undefined

  return {
    delegateeAddress: delegationStatus === 'none' ? undefined : data,
    delegationStatus,
    isLoading,
    refetch,
  }
}
