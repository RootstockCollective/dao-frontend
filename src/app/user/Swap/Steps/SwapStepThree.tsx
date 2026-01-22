import { executeTxFlow } from '@/shared/notification'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { SwapStepProps } from '../types'
import { StakeTokenAmountDisplay } from '@/app/user/Stake/components/StakeTokenAmountDisplay'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'
import { useSwapInput, useTokenSelection, useSwapExecution } from '@/shared/context/SwappingContext/hooks'
import { useSwappingContext } from '@/shared/context/SwappingContext'
import { USDT0, USDRIF } from '@/lib/constants'
import { formatForDisplay } from '@/lib/utils'
import { Hash, formatUnits } from 'viem'
import Big from '@/lib/big'
import { Label } from '@/components/Typography'
import { SwapInputComponent, SwapInputToken } from '@/components/SwapInput'
import { PercentageButtons, PercentageButtonItem } from '@/components/PercentageButtons'

// Slippage tolerance options (in percentage)
const SLIPPAGE_OPTIONS: PercentageButtonItem<number>[] = [
  { value: 0.1, label: '0.1%', testId: 'slippage-0.1' },
  { value: 0.5, label: '0.5%', testId: 'slippage-0.5' },
  { value: 1.0, label: '1%', testId: 'slippage-1.0' },
  { value: 3.0, label: '3%', testId: 'slippage-3.0' },
]

export const SwapStepThree = ({ onGoToStep, onCloseModal, setButtonActions }: SwapStepProps) => {
  const { amountIn, amountOut, quote } = useSwapInput()
  const { tokenInData, tokenOutData } = useTokenSelection()
  const { state, tokenData, setSwapping } = useSwappingContext()
  const { execute, isSwapping, swapError, swapTxHash, canExecute } = useSwapExecution()

  // Slippage tolerance is local to Step 3 - only needed for final confirmation
  const [slippageTolerance, setSlippageTolerance] = useState<number | null>(null)

  // Get values from tokenData
  const tokenInPrice = tokenData.prices[USDT0]
  const tokenOutPrice = tokenData.prices[USDRIF]
  const tokenInBalance = tokenData.balances[USDT0]
  const tokenOutBalance = tokenData.balances[USDRIF]

  const from = useMemo(() => {
    const amountInCurrency = Big(amountIn || '0')
      .times(tokenInPrice)
      .toFixed(2)
    return {
      amount: formatForDisplay(amountIn || '0'),
      amountConvertedToCurrency: `$${amountInCurrency}`,
      balance: formatForDisplay(tokenInBalance),
      tokenSymbol: tokenInData.symbol,
    }
  }, [amountIn, tokenInPrice, tokenInBalance, tokenInData.symbol])

  const to = useMemo(() => {
    const amountValue = amountOut || '0'
    const amountOutCurrency = Big(amountValue).times(tokenOutPrice).toFixed(2)
    return {
      amount: formatForDisplay(amountValue),
      amountConvertedToCurrency: `$${amountOutCurrency}`,
      balance: formatForDisplay(tokenOutBalance),
      tokenSymbol: tokenOutData.symbol,
    }
  }, [amountOut, tokenOutPrice, tokenOutBalance, tokenOutData.symbol])

  // Calculate minimum amount out based on slippage tolerance (local to Step 3)
  const amountOutMinimum = useMemo(() => {
    if (!quote?.amountOut || slippageTolerance === null) return null
    const slippageBps = BigInt(Math.floor(slippageTolerance * 100)) // Convert to basis points
    const slippageAmount = (quote.amountOut * slippageBps) / 10000n
    const minimum = quote.amountOut - slippageAmount
    return minimum > 0n ? minimum : 0n
  }, [quote?.amountOut, slippageTolerance])

  // Format minimum amount for display (2 decimals)
  const formattedMinimumReceived = useMemo(() => {
    if (!amountOutMinimum || !tokenOutData.decimals) return null
    return formatForDisplay(formatUnits(amountOutMinimum, tokenOutData.decimals))
  }, [amountOutMinimum, tokenOutData.decimals])

  // Token for minimum output display
  const minimumOutputToken: SwapInputToken = useMemo(
    () => ({
      symbol: tokenOutData.symbol,
      address: tokenOutData.address,
      name: tokenOutData.name,
      decimals: tokenOutData.decimals || 18,
      price: tokenOutPrice || undefined,
    }),
    [tokenOutData, tokenOutPrice],
  )

  const handleConfirmSwap = useCallback(() => {
    if (!canExecute || !amountOutMinimum) {
      return
    }
    executeTxFlow({
      onRequestTx: async () => {
        const txHash = await execute(amountOutMinimum)
        if (!txHash) {
          throw new Error('Transaction hash is null')
        }
        return txHash as Hash
      },
      onSuccess: onCloseModal,
      onComplete: () => {
        // Reset swapping state when transaction flow completes (success or error)
        setSwapping(false)
      },
      action: 'swap',
    })
  }, [canExecute, amountOutMinimum, execute, onCloseModal, setSwapping])

  // Set button actions - disabled until slippage is selected and minimum is calculated
  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Confirm swap',
        onClick: handleConfirmSwap,
        disabled: !canExecute || !amountIn || !Big(amountIn).gt(0) || !amountOutMinimum || isSwapping,
        loading: isSwapping,
        isTxPending: isSwapping,
      },
      secondary: {
        label: 'Back',
        onClick: () => onGoToStep(0), // Go back to Step One
        disabled: isSwapping, // Disable back button while swapping
        loading: false,
      },
    })
  }, [canExecute, amountIn, isSwapping, amountOutMinimum, handleConfirmSwap, onGoToStep, setButtonActions])

  // At step 3, amountIn should always exist (user came from steps 1 and 2)
  if (!amountIn) {
    // This shouldn't happen, but handle gracefully
    return null
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <StakeTokenAmountDisplay
          label="From"
          amount={from.amount}
          tokenSymbol={from.tokenSymbol}
          amountInCurrency={from.amountConvertedToCurrency}
          balance={from.balance}
        />
        <StakeTokenAmountDisplay
          label="To"
          amount={to.amount}
          tokenSymbol={to.tokenSymbol}
          amountInCurrency={to.amountConvertedToCurrency}
          balance={to.balance}
          isFlexEnd
        />
      </div>

      {/* Slippage Tolerance Selection */}
      <div className="flex flex-col gap-2 mb-6">
        <Label variant="body-s" className="text-text-60">
          Slippage tolerance
        </Label>
        <PercentageButtons
          options={SLIPPAGE_OPTIONS}
          value={slippageTolerance}
          onPercentageClick={setSlippageTolerance}
          testId="slippage-buttons"
        />
      </div>

      {/* Minimum Received - shown after slippage is selected */}
      {formattedMinimumReceived && (
        <div className="mb-6">
          <SwapInputComponent
            tokens={[minimumOutputToken]}
            selectedToken={minimumOutputToken}
            onTokenChange={() => {}}
            amount={formattedMinimumReceived}
            onAmountChange={() => {}}
            readonly
            labelText="Minimum you'll receive"
          />
        </div>
      )}

      <TransactionStatus
        txHash={swapTxHash || state.swapTxHash || undefined}
        isTxFailed={!!swapError || !!state.swapError}
        failureMessage="Swap TX failed."
      />
    </>
  )
}
