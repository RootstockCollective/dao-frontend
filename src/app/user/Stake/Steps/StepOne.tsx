import { StakeInput } from '@/app/user/Stake/StakeInputNew'
import { textsDependingOnAction } from '@/app/user/Stake/Steps/stepsUtils'
import { Button } from '@/components/ButtonNew/Button'
import { ProgressBar } from '@/components/ProgressBarNew'
import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import Big from '@/lib/big'
import { useReadBackersManager } from '@/shared/hooks/contracts'
import { useCallback, useMemo } from 'react'
import { parseEther, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useStakingContext } from '../StakingContext'
import { StepProps } from '../types'
import { formatCurrency } from '@/lib/utils/utils'
import { StakeSteps } from './StakeSteps'

const DECIMAL_SCALES = {
  STAKE: 8,
  UNSTAKE: 18,
}

export const StepOne = ({ onGoNext = () => {} }: StepProps) => {
  const { address } = useAccount()
  const { amount, onAmountChange, tokenToSend, actionName } = useStakingContext()

  const { data: backerTotalAllocation, isLoading: isCanAccountWithdrawLoading } = useReadBackersManager(
    { functionName: 'backerTotalAllocation', args: [address ?? zeroAddress] },
    { refetchInterval: 10000, enabled: !!address, initialData: 0n },
  )

  const isUnstake = useMemo(() => actionName === 'UNSTAKE', [actionName])

  const canAccountWithdraw = useMemo(() => {
    const parsedAmount = parseEther(amount) ?? 0n
    const parsedBalance = parseEther(tokenToSend.balance) ?? 0n
    const balanceThatCanBeWithdraw = parsedBalance - (backerTotalAllocation || 0n)

    return parsedAmount <= balanceThatCanBeWithdraw
  }, [amount, tokenToSend.balance, backerTotalAllocation])

  const balanceToCurrency = useMemo(
    () =>
      Big(tokenToSend.price || 0)
        .mul(tokenToSend.balance)
        .toString(),
    [tokenToSend],
  )

  const isAmountOverBalance = useMemo(() => {
    if (!amount) return false
    const rawAmount = Big(amount)
    const rawBalance = Big(tokenToSend.balance)
    return rawAmount.gt(rawBalance)
  }, [amount, tokenToSend.balance])

  const canGoNext = useMemo(() => {
    return amount && Number(amount) > 0 && !isAmountOverBalance && (!isUnstake || canAccountWithdraw)
  }, [amount, isAmountOverBalance, isUnstake, canAccountWithdraw])

  const shouldShowCannotWithdraw = useMemo(
    () =>
      isUnstake && !isCanAccountWithdrawLoading && !canAccountWithdraw && (backerTotalAllocation || 0n) > 0n,
    [isUnstake, isCanAccountWithdrawLoading, canAccountWithdraw, backerTotalAllocation],
  )

  const totalBalance = useMemo(() => tokenToSend.balance || '0', [tokenToSend.balance])
  const actionTexts = useMemo(() => textsDependingOnAction[actionName], [actionName])

  const handleAmountChange = useCallback(
    (value: string) => {
      if (!value || value === '.') {
        onAmountChange('0')
      } else {
        const regex = /^\d*\.?\d{0,18}$/
        if (regex.test(value)) {
          // remove leading zeros
          onAmountChange(value.replace(/^0+(?=\d)/, ''))
        }
      }
    },
    [onAmountChange],
  )

  return (
    <div className="p-6">
      <Header className="mt-16 mb-4">{actionTexts.modalTitle}</Header>

      <div className="mb-12">
        <StakeSteps currentStep={1} />
        <ProgressBar progress={28} className="mt-3" />
      </div>

      <StakeInput
        onChange={handleAmountChange}
        value={amount}
        symbol={tokenToSend.symbol}
        labelText={actionTexts.inputLabel}
        currencyValue={formatCurrency(balanceToCurrency)}
        decimalScale={DECIMAL_SCALES[actionName]}
        errorText={isAmountOverBalance ? actionTexts.amountError : ''}
      />

      <div className="flex items-center justify-between mx-3 mt-2">
        <div className="flex items-center gap-1">
          <TokenImage symbol="RIF" size={12} />
          <Label variant="body-s" className="text-text-60" data-testid="totalBalanceLabel">
            RIF Balance: {totalBalance}
          </Label>
        </div>
        <Button
          variant="secondary"
          onClick={() => handleAmountChange(totalBalance)}
          className="bg-transparent border border-bg-40 px-2 py-0"
          data-testid="maxButton"
        >
          <Span variant="body-s">Max</Span>
        </Button>
      </div>

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
          disabled={!canGoNext}
          data-testid={actionTexts.confirmButtonText}
        >
          {actionTexts.confirmButtonText}
        </Button>
      </div>
    </div>
  )
}
