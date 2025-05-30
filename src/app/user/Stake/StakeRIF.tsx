import { StakeInput } from '@/app/user/Stake/StakeInputNew'
import { ActionBeingExecuted, textsDependingOnAction } from '@/app/user/Stake/Steps/stepsUtils'
import { Button } from '@/components/ButtonNew/Button'
import { CaretRight } from '@/components/Icons/CaretRight'
import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { StakeSteps } from './Steps/StakeSteps'

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
  <div className="p-6">
    <Header className="mt-16 mb-4">{textsDependingOnAction[actionName].modalTitle}</Header>

    <StakeSteps currentStep={1} />

    <StakeInput
      onChange={onAmountChange}
      value={amount}
      symbol={symbol}
      labelText={textsDependingOnAction[actionName].inputLabel}
      currencyValue={totalBalanceConverted}
    />

    <div className="flex items-center gap-1 mt-2">
      <TokenImage symbol="RIF" size={12} className="ml-1" />
      <Label variant="body-s" className="text-text-60" data-testid="totalBalanceLabel">
        RIF Balance: {totalBalance}
      </Label>
    </div>

    {/* Cannot withdraw paragraph */}
    {shouldShowCannotWithdraw && (
      <Paragraph variant="body-s" className="mt-2">
        It appears you have votes allocated in the Collective Rewards! You can unstake your stRIF anytime.
        However, please note that you must first de-allocate the same amount of stRIF from the Collective
        Rewards
      </Paragraph>
    )}

    <hr className="bg-bg-60 h-px border-0 mt-8 mb-6" />

    <div className="flex justify-end">
      <Button
        variant="primary"
        onClick={onGoNext}
        disabled={!shouldEnableGoNext}
        data-testid={textsDependingOnAction[actionName].confirmButtonText}
      >
        {textsDependingOnAction[actionName].confirmButtonText}
      </Button>
    </div>
  </div>
)
