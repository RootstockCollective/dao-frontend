import { useCallback, useEffect, useMemo, useState } from 'react'
import { Address, Hash, parseEther } from 'viem'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { useTxStatusContext } from '@/shared/context/TxStatusContext'

interface Props {
  amount: string
  tokenToSendContract: Address
  tokenToReceiveContract: Address
}

export const useAllowance = ({ amount, tokenToSendContract, tokenToReceiveContract }: Props) => {
  const { address } = useAccount()
  const [allowanceHash, setAllowanceHash] = useState<Hash>()
  const { trackTransaction } = useTxStatusContext()

  const { data: allowanceBalance, isLoading: isAllowanceReadLoading } = useReadContract({
    abi: RIFTokenAbi,
    address: tokenContracts.RIF,
    functionName: 'allowance',
    args: [address!, tokenToReceiveContract as Address],
    query: {
      refetchInterval: 5000,
    },
  })

  const isAllowanceEnough = useMemo(
    () => !!(allowanceBalance && allowanceBalance >= parseEther(amount)),
    [amount, allowanceBalance],
  )

  const {
    writeContractAsync: requestAllowance,
    data: allowanceTxHash,
    isPending: isRequestingAllowance,
  } = useWriteContract()

  const tx = useWaitForTransactionReceipt({
    hash: allowanceHash,
  })

  const { isPending: isAllowanceTxPending, failureReason: isAllowanceTxFailed } = tx

  const onRequestAllowance = useCallback(
    () =>
      requestAllowance(
        {
          abi: RIFTokenAbi,
          address: tokenToSendContract,
          functionName: 'approve',
          args: [tokenToReceiveContract, parseEther(amount)],
        },
        {
          onSuccess: txHash => setAllowanceHash(txHash),
        },
      ),
    [amount, requestAllowance, tokenToReceiveContract, tokenToSendContract],
  )

  useEffect(() => {
    if (allowanceTxHash) {
      setAllowanceHash(allowanceTxHash)
      trackTransaction(allowanceTxHash)
    }
  }, [allowanceTxHash, trackTransaction])

  return {
    isAllowanceEnough,
    isAllowanceReadLoading,
    onRequestAllowance,
    isRequestingAllowance,
    isAllowanceTxPending: !!(allowanceHash && isAllowanceTxPending && !isAllowanceTxFailed),
    isAllowanceTxFailed: !!(allowanceHash && isAllowanceTxFailed),
    allowanceHash,
  }
}
