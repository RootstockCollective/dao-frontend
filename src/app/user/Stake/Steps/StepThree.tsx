import { StakeStatus } from '@/app/user/Stake/StakeStatus'
import { StepProps } from '@/app/user/Stake/types'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { useRouter } from 'next/navigation'

export const StepThree = ({ onCloseModal = () => {} }: StepProps) => {
  const { stakeTxHash, amountDataToReceive, tokenToReceive, actionName } = useStakingContext()
  const router = useRouter()
  if (!stakeTxHash) return null

  const handleCloseModal = () => {
    router.push(`/user?txHash=${stakeTxHash}`)
    onCloseModal()
  }
  return (
    <StakeStatus
      onReturnToBalances={handleCloseModal}
      hash={stakeTxHash}
      symbol={tokenToReceive.symbol}
      amountReceived={amountDataToReceive.amountToReceive}
      amountReceivedCurrency={amountDataToReceive.amountToReceiveConvertedToCurrency}
      actionName={actionName}
    />
  )
}
