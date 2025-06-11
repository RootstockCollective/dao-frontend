import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { Address, parseEther } from 'viem'
import { useEffect } from 'react'
import { useTxStatusContext } from '@/shared/context/TxStatusContext'

export const useUnstakeStRIF = (tokenToSendContract: Address) => {
  const { address } = useAccount()
  const { trackTransaction } = useTxStatusContext()

  const { writeContractAsync: unstake, data: unstakeTxHash, isPending: isRequesting } = useWriteContract()

  const tx = useWaitForTransactionReceipt({
    hash: unstakeTxHash,
  })

  const { isPending: isTxPending, failureReason: isTxFailed } = tx

  const onRequestUnstake = (amount: string) =>
    unstake({
      abi: StRIFTokenAbi,
      address: tokenToSendContract as Address,
      functionName: 'withdrawTo',
      args: [address as Address, parseEther(amount)],
    })

  useEffect(() => {
    if (unstakeTxHash) {
      trackTransaction(unstakeTxHash)
    }
  }, [unstakeTxHash, trackTransaction])

  return {
    onRequestUnstake,
    isRequesting,
    isTxPending: !!(unstakeTxHash && isTxPending && !isTxFailed),
    isTxFailed: !!(unstakeTxHash && isTxFailed),
    unstakeTxHash,
  }
}
