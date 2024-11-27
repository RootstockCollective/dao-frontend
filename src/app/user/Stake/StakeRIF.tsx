import { Header, Label, Paragraph } from '@/components/Typography'
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
          onClick={value => {
            const calculatedAmount = (parseFloat(totalBalance) * (value / 100)).toFixed(8)
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
      // More precise calculation using string operations
      const totalAmount = parseFloat(totalAmountAllowed)
      const expectedAmount = ((totalAmount * percentage) / 100).toFixed(8)
      const currentAmount = parseFloat(amount).toFixed(8)

      // Compare the strings directly instead of floating point numbers
      return currentAmount === expectedAmount
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
