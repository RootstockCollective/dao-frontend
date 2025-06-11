import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { useTxStatusContext } from '@/shared/context/TxStatusContext'
import { useCallback, useEffect, useState } from 'react'
import { Address, Hash, parseEther } from 'viem'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

export const useStakeRIF = (amount: string, tokenToReceiveContract: Address) => {
  const { address } = useAccount()
  const [stakeHash, setStakeHash] = useState<Hash>()
  const { trackTransaction } = useTxStatusContext()

  const { writeContractAsync: stake, data: stakeTxHash, isPending: isRequesting } = useWriteContract()

  const tx = useWaitForTransactionReceipt({
    hash: stakeHash,
  })
  const { isPending: isTxPending, failureReason: isTxFailed } = tx

  const onRequestStake = useCallback(
    () =>
      stake({
        abi: StRIFTokenAbi,
        address: tokenToReceiveContract,
        functionName: 'depositAndDelegate',
        args: [address!, parseEther(amount)],
      }),
    [address, amount, stake, tokenToReceiveContract],
  )

  useEffect(() => {
    if (stakeTxHash) {
      setStakeHash(stakeTxHash)
      trackTransaction(stakeTxHash)
    }
  }, [stakeTxHash, trackTransaction])

  return {
    onRequestStake,
    isRequesting,
    isTxPending: !!(stakeHash && isTxPending && !isTxFailed),
    isTxFailed: !!(stakeHash && isTxFailed),
    stakeHash,
  }
}
