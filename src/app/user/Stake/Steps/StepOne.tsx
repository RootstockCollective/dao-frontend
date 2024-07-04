import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { useMemo } from 'react'
import { StakeRIF } from '@/app/user/Stake/StakeRIF'
import { StepProps } from '@/app/user/Stake/types'

export const StepOne = ({ onGoNext }: StepProps) => {
  const { amount, onAmountChange, balances, prices } = useStakingContext()
  const RIFTotalBalance = useMemo(() => Number(balances.rif?.balance) ?? 0, [balances])

  const RIFTotalBalanceConverted = useMemo(
    () => (prices.rif.price ?? 0) * RIFTotalBalance,
    [prices, RIFTotalBalance],
  )

  const onPercentageClicked = (percentage: number) => {
    onAmountChange((RIFTotalBalance * (percentage / 100)).toString())
  }

  const shouldEnableGoNext = useMemo(() => {
    if (Number(amount) <= 0) {
      return false
    }

    return Number(amount) <= RIFTotalBalance
  }, [amount, RIFTotalBalance])

  return (
    <StakeRIF
      amount={amount}
      onAmountChange={onAmountChange}
      onPercentageClicked={onPercentageClicked}
      onGoNext={onGoNext ? onGoNext : () => {}}
      shouldEnableGoNext={shouldEnableGoNext}
      totalBalance={RIFTotalBalance.toString()}
      totalBalanceConverted={'$ USD ' + RIFTotalBalanceConverted.toString()}
    />
  )
}
