import { StakeStatus } from '@/app/user/Stake/StakeStatus'
import { StepProps } from '@/app/user/Stake/types'
import { useStakingContext } from '@/app/user/Stake/StakingContext'

export const StepThree = ({ onCloseModal }: StepProps) => {
  // TODO get TX current status and pass to StakeStatus
  const { stakeTxHash, amountDataToReceive, tokenToReceive, actionName } = useStakingContext()
  if (!stakeTxHash) return null
  return (
    <StakeStatus
      onReturnToBalances={onCloseModal || (() => {})}
      hash={stakeTxHash}
      symbol={tokenToReceive.symbol}
      amountReceived={amountDataToReceive.amountToReceive}
      amountReceivedCurrency={amountDataToReceive.amountToReceiveConvertedToCurrency}
      actionName={actionName}
    />
  )
}
