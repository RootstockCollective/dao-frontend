import { Header, Label, Paragraph } from '@/components/Typography'
import { StakeInputNew } from '@/app/user/Stake/StakeInputNew'
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
  shouldShowCannotWithdraw?: boolean
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
  shouldShowCannotWithdraw = false,
}: Props) => (
  <div className="px-[50px] py-[20px]">
    <Header className="text-center font-normal" fontFamily="kk-topo">
      {textsDependingOnAction[actionName].modalTitle}
      {symbol}
    </Header>
    <StakeInputNew
      onChange={onAmountChange}
      value={amount}
      symbol={symbol}
      labelText={textsDependingOnAction[actionName].inputLabel}
      currencyValue={totalBalanceConverted}
    />
    <Label>
      Available: <span data-testid="totalBalance">{totalBalance}</span>{' '}
      <span data-testid="symbol">{symbol}</span>{' '}
      {totalBalanceConverted && <span data-testid="totalBalanceConverted">= {totalBalanceConverted}</span>}
    </Label>
    {/* Percentage button */}
    <div className="flex justify-end gap-2 pt-1">
      {[10, 20, 50, 100].map((percentage: number, i) => (
        <PercentageButton
          key={i}
          percentage={percentage}
          onClick={value => {
            const calculatedAmount = (parseFloat(totalBalance) * (value / 100)).toString()
            onAmountChange(calculatedAmount) // Update input value
            onPercentageClicked(value) // Notify parent
          }}
          totalAmountAllowed={totalBalance}
          amount={amount}
        />
      ))}
    </div>
    {/* Cannot withdraw paragraph */}
    {shouldShowCannotWithdraw && (
      <Paragraph size="small" className="mt-2">
        It appears you have votes allocated in the Collective Rewards! You can unstake your stRIF anytime.
        However, please note that you must first de-allocate the same amount of stRIF from the Collective
        Rewards
      </Paragraph>
    )}
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
    if (!amount || !totalAmountAllowed) return false

    try {
      const totalAmount = Number(totalAmountAllowed)
      const currentAmount = Number(amount)

      // Calculate raw value for comparison (not display)
      const rawExpectedAmount = (totalAmount * percentage) / 100

      if (percentage === 100) {
        // For 100%, compare raw values
        return Math.abs(currentAmount - totalAmount) < 1e-8
      }

      // For other percentages, compare raw values with small epsilon
      return Math.abs(currentAmount - rawExpectedAmount) < 1e-8
    } catch (error) {
      console.error('Error calculating percentage button state:', error)
      return false
    }
  }, [amount, totalAmountAllowed, percentage])

  return (
    <Button
      variant={isActive ? 'secondary-full' : 'secondary'}
      onClick={onPercentageClicked}
      buttonProps={{
        'data-testid': `Percentage${percentage}`,
      }}
    >
      {`${percentage}%`}
    </Button>
  )
}
