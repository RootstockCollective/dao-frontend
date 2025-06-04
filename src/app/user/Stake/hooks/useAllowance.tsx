import { useCallback, useEffect, useMemo, useState } from 'react'
import { Address, Hash, parseEther } from 'viem'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { useTxStatusContext } from '@/shared/context/TxStatusContext'

interface Props {
  amount: string
  tokenToSendContract: string
  tokenToReceiveContract: string
}

export const useAllowance = ({ amount, tokenToSendContract, tokenToReceiveContract }: Props) => {
  const { address } = useAccount()
  const [allowanceHash, setAllowanceHashUsed] = useState<Hash>()
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

  useEffect(() => {
    if (allowanceTxHash) {
      setAllowanceHashUsed(allowanceTxHash)
      trackTransaction(allowanceTxHash)
    }
  }, [allowanceTxHash, trackTransaction])

  const onRequestAllowance = useCallback(
    () =>
      requestAllowance(
        {
          abi: RIFTokenAbi,
          address: tokenToSendContract as Address,
          functionName: 'approve',
          args: [tokenToReceiveContract as Address, parseEther(amount)],
        },
        {
          onSuccess: txHash => setAllowanceHashUsed(txHash),
        },
      ),
    [amount, requestAllowance, tokenToReceiveContract, tokenToSendContract],
  )

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
