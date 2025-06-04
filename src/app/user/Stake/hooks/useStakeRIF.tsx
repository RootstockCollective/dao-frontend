import { ActionHookToUse } from '@/app/user/Stake/StakingContext'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { useCallback } from 'react'
import { Address, parseEther } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

export const useStakeRIF: ActionHookToUse = (amount: string, tokenToReceiveContract: string) => {
  const { address } = useAccount()
  const { writeContractAsync: stake, isPending } = useWriteContract()

  const onRequestStake = useCallback(
    () =>
      stake({
        abi: StRIFTokenAbi,
        address: tokenToReceiveContract as Address,
        functionName: 'depositAndDelegate',
        args: [address!, parseEther(amount)],
      }),
    [address, amount, stake, tokenToReceiveContract],
  )

  return {
    onConfirm: onRequestStake,
    customFooter: null,
    isPending,
  }
}
