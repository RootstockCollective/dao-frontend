import { Header, Label } from '@/components/Typography'
import { StakeInput } from '@/app/user/Stake/StakeInput'
import { Button } from '@/components/Button'
import { useCallback, useMemo } from 'react'

interface Props {
  amount: string
  onAmountChange: (value: string) => void
  onPercentageClicked: (value: number) => void
  onGoNext: () => void
  shouldEnableGoNext: boolean
  totalBalance: string
  totalBalanceConverted: string
}
export const StakeRIF = ({
  amount,
  onAmountChange,
  onPercentageClicked,
  onGoNext,
  shouldEnableGoNext,
  totalBalance,
  totalBalanceConverted,
}: Props) => {
  const onUserAmountInput = useCallback(
    (value: string) => {
      onAmountChange(value)
    },
    [onAmountChange],
  )

  const onPercentageButtonClick = useCallback(
    (percentageClicked: number) => onPercentageClicked(percentageClicked),
    [onPercentageClicked],
  )

  return (
    <div>
      <div className="px-[50px] py-[20px]">
        <Header>Stake RIF</Header>
        {/* @TODO make this dynamic */}
        <StakeInput onChange={onUserAmountInput} value={amount} />
        <Label variant="light">
          Available: {totalBalance} RIF = {totalBalanceConverted}
        </Label>
        {/* Percentage button */}
        <div className="flex justify-end gap-2 pt-1">
          <PercentageButton
            percentage={10}
            onClick={onPercentageButtonClick}
            totalAmountAllowed={totalBalance}
            amount={amount}
          />
          <PercentageButton
            percentage={20}
            onClick={onPercentageButtonClick}
            totalAmountAllowed={totalBalance}
            amount={amount}
          />
          <PercentageButton
            percentage={50}
            onClick={onPercentageButtonClick}
            totalAmountAllowed={totalBalance}
            amount={amount}
          />
          <PercentageButton
            percentage={100}
            onClick={onPercentageButtonClick}
            totalAmountAllowed={totalBalance}
            amount={amount}
          />
        </div>
        {/* @TODO if we're unstaking we should have a component here - check design */}
        {/* Stake */}
        <div className="flex justify-center pt-10">
          <Button onClick={shouldEnableGoNext ? onGoNext : undefined} disabled={!shouldEnableGoNext}>
            Stake
          </Button>
          {/* @TODO make this dynamic Stake/Unstake*/}
        </div>
      </div>
    </div>
  )
}

interface PercentageButtonProps {
  amount: string
  percentage: number
  totalAmountAllowed: string
  onClick: (percentageClicked: number) => void
}

const PercentageButton = ({ amount, percentage, totalAmountAllowed, onClick }: PercentageButtonProps) => {
  const onPercentageButtonClick = () => onClick(percentage)

  const isActive = useMemo(() => {
    const totalAmountAllowedPercentage = Number(totalAmountAllowed) * (percentage / 100)
    return Number(amount) === totalAmountAllowedPercentage
  }, [amount, totalAmountAllowed, percentage])

  return (
    <Button
      variant={isActive ? 'secondary-full' : 'secondary'}
      onClick={onPercentageButtonClick}
    >{`${percentage}%`}</Button>
  )
}
