import { ActionHookToUse } from '@/app/user/Stake/StakingContext'
import { useAccount, useWriteContract } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { Address, parseEther } from 'viem'
import { useAlertContext } from '@/app/providers'
import { TX_MESSAGES } from '@/shared/txMessages'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'

export const useUnstakeStRIF: ActionHookToUse = (amount, tokenToSendContract) => {
  const { address } = useAccount()
  const { setMessage } = useAlertContext() // Get the setMessage function from the alert context

  const { writeContractAsync: unstake, isPending } = useWriteContract()

  const onRequestUnstake = async () => {
    try {
      const response = await unstake({
        abi: StRIFTokenAbi,
        address: tokenToSendContract as Address,
        functionName: 'withdrawTo',
        args: [address as Address, parseEther(amount)],
      })
      setMessage(TX_MESSAGES.unstaking.success)
      return response
    } catch (err: any) {
      if (!isUserRejectedTxError(err)) {
        setMessage(TX_MESSAGES.unstaking.error)
      }
      throw err // Re-throw to allow caller to handle
    }
  }
  return {
    isAllowanceEnough: true,
    customFooter: null,
    onConfirm: onRequestUnstake,
    isPending,
  }
}
