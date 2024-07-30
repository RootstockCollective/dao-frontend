import { Header, Label } from '@/components/Typography'
import { StakeInput } from '@/app/user/Stake/StakeInput'
import { Button } from '@/components/Button'
import { useCallback, useMemo } from 'react'
import { ActionBeingExecuted, textsDependingOnAction } from '@/app/user/Stake/Steps/stepsUtils'

interface Props {
  amount: string
  onAmountChange: (value: string) => void
  onPercentageClicked: (value: number) => void
  onGoNext: () => void
  shouldEnableGoNext: boolean
  totalBalance: string
  totalBalanceConverted: string
  symbol: string
  actionName: ActionBeingExecuted
}

export const StakeRIF = ({
  amount,
  onAmountChange,
  onPercentageClicked,
  onGoNext,
  shouldEnableGoNext,
  totalBalance,
  totalBalanceConverted,
  actionName,
  symbol = 'RIF',
}: Props) => {
  const onUserAmountInput = useCallback((value: string) => onAmountChange(value), [onAmountChange])

  const onPercentageButtonClick = useCallback(
    (percentageClicked: number) => onPercentageClicked(percentageClicked),
    [onPercentageClicked],
  )

  return (
    <div>
      <div className="px-[50px] py-[20px]">
        <Header className="text-center">
          {textsDependingOnAction[actionName].modalTitle}
          {symbol}
        </Header>
        <StakeInput
          onChange={onUserAmountInput}
          value={amount}
          symbol={symbol}
          labelText={textsDependingOnAction[actionName].inputLabel}
        />
        <Label>
          Available: {totalBalance} {symbol} {totalBalanceConverted && `= ${totalBalanceConverted}`}
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
          <Button
            onClick={shouldEnableGoNext ? onGoNext : undefined}
            disabled={!shouldEnableGoNext}
            buttonProps={{
              'data-testid': 'StakeRIF',
            }}
          >
            {textsDependingOnAction[actionName].confirmButtonText}
          </Button>
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
      buttonProps={{
        'data-testid': `Percentage${percentage}`,
      }}
    >{`${percentage}%`}</Button>
  )
}
