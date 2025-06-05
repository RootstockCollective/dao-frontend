import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { Address, Hash, parseEther } from 'viem'
import { useEffect, useState } from 'react'
import { useTxStatusContext } from '@/shared/context/TxStatusContext'

export const useUnstakeStRIF = (tokenToSendContract: Address) => {
  const { address } = useAccount()
  const [unstakeTxHash, setUnstakeTxHash] = useState<Hash>()
  const { trackTransaction } = useTxStatusContext()

  const { writeContractAsync: unstake, isPending: isRequesting } = useWriteContract()

  const tx = useWaitForTransactionReceipt({
    hash: unstakeTxHash,
  })

  const { isPending: isTxPending, failureReason: isTxFailed } = tx

  const onRequestUnstake = (amount: string) =>
    unstake(
      {
        abi: StRIFTokenAbi,
        address: tokenToSendContract as Address,
        functionName: 'withdrawTo',
        args: [address as Address, parseEther(amount)],
      },
      {
        onSuccess: txHash => setUnstakeTxHash(txHash),
      },
    )

  useEffect(() => {
    if (unstakeTxHash) {
      trackTransaction(unstakeTxHash)
    }
  }, [unstakeTxHash])

  return {
    customFooter: null,
    onRequestUnstake,
    isRequesting,
    isTxPending: !!(unstakeTxHash && isTxPending && !isTxFailed),
    isTxFailed: !!(unstakeTxHash && isTxFailed),
    unstakeTxHash,
  }
}
