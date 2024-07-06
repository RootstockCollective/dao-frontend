import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { currentEnvContracts } from '@/lib/contracts'
import { Address, parseEther } from 'viem'
import { useCallback, useMemo } from 'react'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { Button } from '@/components/Button'
import { Paragraph } from '@/components/Typography'
import { goToExplorerWithTxHash } from '@/lib/utils'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { ActionHookToUse } from '@/app/user/Stake/StakingContext'

export const useStakeRIF: ActionHookToUse = (
  amount: string,
  tokenToSendContract: string,
  tokenToReceiveContract: string,
) => {
  const { address } = useAccount()
  const { stakeModalData, onUpdateStakeModalData } = useBalancesContext()

  const previousAllowanceHash = stakeModalData?.savedAllowanceTxHash

  const { data: allowanceBalance, isLoading: isAllowanceReadLoading } = useReadContract({
    abi: RIFTokenAbi,
    address: currentEnvContracts.RIF as Address,
    functionName: 'allowance',
    args: [address!, tokenToReceiveContract as Address],
    query: {
      refetchInterval: 5000,
    },
  })
  const isAllowanceEnough = useMemo(() => {
    console.log({ allowanceBalance, amount })
    return !!(allowanceBalance && allowanceBalance >= parseEther(amount))
  }, [amount, allowanceBalance])

  const { writeContractAsync: requestAllowance, data: allowanceTxHash } = useWriteContract()

  const allowanceHashUsed = useMemo(
    () => allowanceTxHash || previousAllowanceHash,
    [allowanceTxHash, previousAllowanceHash],
  )

  const { status: requestAllowanceTxStatus } = useWaitForTransactionReceipt({
    hash: allowanceHashUsed,
  })

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
          onSuccess: txHash => {
            if (onUpdateStakeModalData) onUpdateStakeModalData('savedAllowanceTxHash', txHash)
          },
        },
      ),
    [amount, onUpdateStakeModalData, requestAllowance, tokenToReceiveContract, tokenToSendContract],
  )
  const { writeContractAsync: stake } = useWriteContract()

  const onRequestStake = () =>
    stake({
      abi: StRIFTokenAbi,
      address: tokenToReceiveContract as Address,
      functionName: 'depositAndDelegate',
      args: [address!, parseEther(amount)],
    })

  const shouldEnableConfirm = useMemo(() => {
    // Only enable when allowance is enough
    return isAllowanceEnough
  }, [isAllowanceEnough])
  const customFooter = useMemo(
    () => (
      <CustomStakingRIFFooter
        isAllowanceNeeded={!isAllowanceEnough}
        onRequestAllowance={onRequestAllowance}
        hash={allowanceHashUsed}
        isAllowanceTxPending={allowanceHashUsed && requestAllowanceTxStatus === 'pending'}
        isAllowanceReadLoading={isAllowanceReadLoading}
      />
    ),
    [
      isAllowanceEnough,
      onRequestAllowance,
      allowanceHashUsed,
      requestAllowanceTxStatus,
      isAllowanceReadLoading,
    ],
  )
  return {
    shouldEnableConfirm,
    onConfirm: onRequestStake,
    customFooter,
  }
}

interface CustomStakingRIFFooterProps {
  isAllowanceNeeded: boolean
  onRequestAllowance: () => void
  isAllowanceTxPending?: boolean
  hash?: string
  isAllowanceReadLoading?: boolean
}
/**
 * We will have this component to render info to the user in case they are lacking a validation
 * This will let the user know if they need to request allowance
 * This will also let the user know that their allowance TX is in process
 * @constructor
 */
function CustomStakingRIFFooter({
  isAllowanceNeeded,
  onRequestAllowance,
  hash,
  isAllowanceTxPending,
  isAllowanceReadLoading = false,
}: CustomStakingRIFFooterProps) {
  switch (true) {
    case isAllowanceReadLoading:
      return (
        <div className="flex justify-center">
          <Paragraph>Fetching current allowance...</Paragraph>
        </div>
      )
    case isAllowanceNeeded && !isAllowanceTxPending:
      return (
        <div className="flex flex-col mt-2 gap-2 items-center">
          <Paragraph>You need to request allowance for StRIF to be able to stake.</Paragraph>
          <Button onClick={onRequestAllowance}>Request allowance</Button>
        </div>
      )
    case isAllowanceNeeded && isAllowanceTxPending && !!hash:
      return (
        <div className="flex flex-col mt-2 gap-2 items-center">
          <Paragraph>Allowance TX is in process.</Paragraph>
          <Paragraph>Wait for Allowance TX to be mined.</Paragraph>
          <Button onClick={() => goToExplorerWithTxHash(hash)}>Click here to go to the explorer</Button>
        </div>
      )
    default:
      return null
  }
}
