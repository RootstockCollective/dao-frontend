import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BACKERS_MANAGER_ADDRESS } from '@/lib/constants'
import { useAccount, useReadContract } from 'wagmi'

export const useCanAccountUnstakeAmount = (amount: bigint) => {
  const { address } = useAccount()
  const {
    data: canAccountWithdraw,
    isLoading: isCanAccountWithdrawLoading,
    refetch: refetchCanAccountWithdraw,
  } = useReadContract(
    address && {
      abi: BackersManagerAbi,
      address: BACKERS_MANAGER_ADDRESS,
      functionName: 'canWithdraw',
      args: [address, amount],
      query: {
        enabled: false,
      },
    },
  )

  return {
    canAccountWithdraw,
    isCanAccountWithdrawLoading,
    refetchCanAccountWithdraw,
  }
}
