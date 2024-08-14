import { ActionHookToUse } from '@/app/user/Stake/StakingContext'
import { useAccount, useWriteContract } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { Address, parseEther } from 'viem'

export const useUnstakeStRIF: ActionHookToUse = (amount, tokenToSendContract) => {
  const { address } = useAccount()

  const { writeContractAsync: unstake, isPending } = useWriteContract()

  const onRequestUnstake = () =>
    unstake({
      abi: StRIFTokenAbi,
      address: tokenToSendContract as Address,
      functionName: 'withdrawTo',
      args: [address as Address, parseEther(amount)],
    })
  return {
    shouldEnableConfirm: true,
    customFooter: null,
    onConfirm: onRequestUnstake,
    isPending,
  }
}
