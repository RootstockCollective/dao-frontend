import { ActionHookToUse } from '@/app/user/Stake/StakingContext'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Address, Hash, parseEther } from 'viem'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { CustomStakingRIFFooter } from '../CustomStakingRIFFooter'
import { useAlertContext } from '@/app/providers'
import { TX_MESSAGES } from '@/shared/txMessages'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'

export const useStakeRIF: ActionHookToUse = (
  amount: string,
  tokenToSendContract: string,
  tokenToReceiveContract: string,
) => {
  const { address } = useAccount()
  const [allowanceHash, setAllowanceHashUsed] = useState<Hash>()
  const { setMessage } = useAlertContext() // Get the setMessage function from the alert context

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
    }
  }, [allowanceTxHash])

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
  const { writeContractAsync: stake, isPending } = useWriteContract()

  const onRequestStake = async () => {
    try {
      const response = await stake({
        abi: StRIFTokenAbi,
        address: tokenToReceiveContract as Address,
        functionName: 'depositAndDelegate',
        args: [address!, parseEther(amount)],
      })
      setMessage(TX_MESSAGES.staking.success)
      return response
    } catch (err: any) {
      if (!isUserRejectedTxError(err)) {
        setMessage(TX_MESSAGES.staking.error)
      }
      throw err
    }
  }
  const customFooter = useMemo(
    () => (
      <CustomStakingRIFFooter
        hash={allowanceHash}
        isAllowanceNeeded={!isAllowanceEnough}
        isAllowanceTxPending={allowanceHash && isAllowanceTxPending && !isAllowanceTxFailed}
        isAllowanceReadLoading={isAllowanceReadLoading}
        isAllowanceTxFailed={!!isAllowanceTxFailed}
      />
    ),
    [allowanceHash, isAllowanceEnough, isAllowanceTxPending, isAllowanceReadLoading, isAllowanceTxFailed],
  )
  return {
    isAllowanceEnough,
    onConfirm: onRequestStake,
    customFooter,
    isAllowanceReadLoading,
    isPending,
    onRequestAllowance,
    isRequestingAllowance,
  }
}
