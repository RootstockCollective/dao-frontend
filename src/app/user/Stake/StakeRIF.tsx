import { Header, Label } from '@/components/Typography'
import { StakeInput } from '@/app/user/Stake/StakeInput'
import { Button } from '@/components/Button'
import { useMemo } from 'react'
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
}: Props) => (
  <div className="px-[50px] py-[20px]">
    <Header className="text-center font-normal" fontFamily="kk-topo">
      {textsDependingOnAction[actionName].modalTitle}
      {symbol}
    </Header>
    <StakeInput
      onChange={onAmountChange}
      value={amount}
      symbol={symbol}
      labelText={textsDependingOnAction[actionName].inputLabel}
    />
    <Label>
      Available: {totalBalance} {symbol} {totalBalanceConverted && `= ${totalBalanceConverted}`}
    </Label>
    {/* Percentage button */}
    <div className="flex justify-end gap-2 pt-1">
      {[10, 20, 50, 100].map((percentage: number, i) => (
        <PercentageButton
          key={i}
          percentage={percentage}
          onClick={onPercentageClicked}
          totalAmountAllowed={totalBalance}
          amount={amount}
        />
      ))}
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
)

interface PercentageButtonProps {
  amount: string
  percentage: number
  totalAmountAllowed: string
  onClick: (percentageClicked: number) => void
}

const PercentageButton = ({ amount, percentage, totalAmountAllowed, onClick }: PercentageButtonProps) => {
  const onPercentageClicked = () => onClick(percentage)

  const isActive = useMemo(() => {
    const totalAmountAllowedPercentage = Number(totalAmountAllowed) * (percentage / 100)
    return Number(amount) === totalAmountAllowedPercentage
  }, [amount, totalAmountAllowed, percentage])

  return (
    <Button
      variant={isActive ? 'secondary-full' : 'secondary'}
      onClick={onPercentageClicked}
      buttonProps={{
        'data-testid': `Percentage${percentage}`,
      }}
    >{`${percentage}%`}</Button>
  )
}
