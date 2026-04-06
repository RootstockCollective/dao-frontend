import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Hash, parseUnits } from 'viem'

import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { ArrowsUpDown } from '@/components/Icons'
import { PercentageButtonItem, PercentageButtons } from '@/components/PercentageButtons'
import { SwapInputComponent, SwapInputToken } from '@/components/SwapInput'
import { Label } from '@/components/Typography'
import Big from '@/lib/big'
import { WRBTC } from '@/lib/constants'
import { feeTierToPercent, SWAP_FLOW_TOKEN_SYMBOLS, UNISWAP_FEE_TIERS } from '@/lib/swap/constants'
import { formatForDisplay, handleAmountInput } from '@/lib/utils'
import { useExecuteTxFlow } from '@/shared/notification'
import {
  type SwapTokenSymbol,
  useSwapInput,
  useSwapTokens,
  useTokenAllowance,
  useTokenSelection,
} from '@/shared/stores/swap'

import { SwapStepWarning } from '../components/SwapStepWarning'
import { useSwapBtcSideBalances } from '../hooks/useSwapBtcSideBalances'
import { SwapStepProps } from '../types'
import { LOW_LIQUIDITY_WARNING_MESSAGE, shouldShowLowLiquidityWarning } from '../utils/low-liquidity-warning'

const AUTO_FEE_TIER = 'auto' as const

function buildFeeTierOptions(): PercentageButtonItem<string>[] {
  return [
    { value: AUTO_FEE_TIER, label: 'Auto', testId: 'fee-tier-auto' },
    ...UNISWAP_FEE_TIERS.map(tier => ({
      value: String(tier),
      label: `${feeTierToPercent(tier)}%`,
      testId: `fee-tier-${tier}`,
    })),
  ]
}

export const SwapStepOne = ({ onGoNext, setButtonActions }: SwapStepProps) => {
  const {
    amountIn,
    amountOut,
    setAmountIn,
    setAmountOut,
    isQuoting,
    isQuoteExpired,
    quoteError,
    quote,
    mode,
    selectedFeeTier,
    setSelectedFeeTier,
    activeFeeTier,
    availableFeeTiers,
  } = useSwapInput()
  const { tokenIn, tokenOut, tokenInData, tokenOutData, setTokenIn, setTokenOut, toggleTokenSelection } =
    useTokenSelection()
  const { tokens: swapTokenMeta } = useSwapTokens()
  const { balances, prices } = useBalancesContext()
  const btcSide = useSwapBtcSideBalances()
  const { execute: executeTxFlow, isExecuting: isApproving } = useExecuteTxFlow()
  const { allowance, hasSufficientAllowance, approve, refetchAllowance, isCheckingAllowance } =
    useTokenAllowance()
  const inputRef = useRef<HTMLInputElement>(null)
  // Track which field the user is actively typing in (prevents loop from programmatic value updates)
  const activeFieldRef = useRef<'in' | 'out' | null>(null)

  // Get balances and prices from context (WrBTC row uses chain reads: combined for max when selling BTC side)
  const tokenInBalance = useMemo(() => {
    if (tokenIn === WRBTC) return btcSide.combinedBalanceFormatted
    return balances[tokenIn]?.balance ?? '0'
  }, [balances, btcSide.combinedBalanceFormatted, tokenIn])

  const tokenOutBalance = useMemo(() => {
    if (tokenOut === WRBTC) return btcSide.wrbtcBalanceFormatted
    return balances[tokenOut]?.balance ?? '0'
  }, [balances, btcSide.wrbtcBalanceFormatted, tokenOut])
  const tokenInPrice = prices[tokenIn]?.price ?? 0
  const tokenOutPrice = prices[tokenOut]?.price ?? 0

  const selectableSwapTokens: SwapInputToken[] = useMemo(
    () =>
      SWAP_FLOW_TOKEN_SYMBOLS.map(symbol => {
        const t = swapTokenMeta[symbol]
        return {
          symbol: t.symbol,
          address: t.address,
          name: t.name,
          decimals: t.decimals,
          price: prices[symbol]?.price ?? undefined,
        }
      }),
    [swapTokenMeta, prices],
  )

  const handleTokenInChange = useCallback(
    (token: SwapInputToken) => {
      setTokenIn(token.symbol as SwapTokenSymbol)
    },
    [setTokenIn],
  )

  const handleTokenOutChange = useCallback(
    (token: SwapInputToken) => {
      setTokenOut(token.symbol as SwapTokenSymbol)
    },
    [setTokenOut],
  )

  // Display values: typed field shows raw, derived field shows formatted (2 decimals)
  // When empty, return '' so the placeholder "0" shows
  const displayAmountIn = useMemo(() => {
    if (!amountIn) return ''
    if (mode === 'exactIn') return amountIn // User is typing, show raw
    return formatForDisplay(amountIn) // Derived from quote, format it
  }, [mode, amountIn])

  const displayAmountOut = useMemo(() => {
    if (!amountOut) return ''
    if (mode === 'exactOut') return amountOut // User is typing, show raw
    return formatForDisplay(amountOut) // Derived from quote, format it
  }, [mode, amountOut])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      activeFieldRef.current = 'in' // Set active field on initial focus
    }
  }, [])

  const isAmountOverBalance = useMemo(() => {
    if (!amountIn) return false
    return Big(amountIn).gt(tokenInBalance)
  }, [amountIn, tokenInBalance])

  /** Typed amount exceeds on-chain WrBTC balance while native could cover the rest — swap still needs ERC-20. */
  const isWrbtcSpendShortage = useMemo(() => {
    if (tokenIn !== WRBTC || !amountIn || !tokenInData.decimals) return false
    try {
      const req = parseUnits(amountIn, tokenInData.decimals)
      return req > btcSide.wrbtcWei
    } catch {
      return false
    }
  }, [amountIn, btcSide.wrbtcWei, tokenIn, tokenInData.decimals])

  // Calculate required amount
  const requiredAmount = useMemo(() => {
    if (!amountIn || !tokenInData.decimals) return 0n
    try {
      return parseUnits(amountIn, tokenInData.decimals)
    } catch {
      return 0n
    }
  }, [amountIn, tokenInData.decimals])

  // Check if ERC-20 allowance is sufficient
  const isAllowanceEnough = useMemo(() => {
    if (allowance === null || requiredAmount === 0n) return false
    return hasSufficientAllowance(requiredAmount)
  }, [allowance, requiredAmount, hasSufficientAllowance])

  // Handle Continue click - approve if needed, then advance
  const handleContinue = useCallback(() => {
    if (isAllowanceEnough) {
      // ERC-20 already approved, just advance
      onGoNext()
    } else {
      // Need ERC-20 approval
      void executeTxFlow({
        onRequestTx: async () => {
          const txHash = await approve(requiredAmount)
          if (!txHash) {
            throw new Error('Transaction hash is null')
          }
          return txHash as Hash
        },
        onSuccess: async () => {
          // Verify allowance after approval
          const { data: newAllowance } = await refetchAllowance()
          if (typeof newAllowance !== 'bigint' || newAllowance < requiredAmount) {
            throw new Error('Allowance verification failed')
          }
          onGoNext()
        },
        action: 'allowance',
      })
    }
  }, [isAllowanceEnough, requiredAmount, approve, refetchAllowance, onGoNext, executeTxFlow])

  // Set button actions
  useEffect(() => {
    const hasValidAmount = amountIn && Big(amountIn).gt(0)
    const hasQuote = !!quote && amountOut && Big(amountOut).gt(0)
    // Disable if quote is expired, still loading, checking allowance, or invalid
    const isDisabled =
      !hasValidAmount ||
      isAmountOverBalance ||
      isWrbtcSpendShortage ||
      isQuoting ||
      !hasQuote ||
      isQuoteExpired ||
      isApproving ||
      isCheckingAllowance

    // Show "Continue" as default when:
    // - No valid amount entered yet (we can't determine if approval is needed)
    // - Still checking allowance
    // - Allowance is sufficient
    // Show "Approve & Continue" only when we have a valid amount AND we're sure allowance is insufficient
    const needsApproval = hasValidAmount && !isCheckingAllowance && !isAllowanceEnough
    const buttonLabel = needsApproval ? 'Approve & Continue' : 'Continue'

    setButtonActions({
      primary: {
        label: buttonLabel,
        onClick: handleContinue,
        disabled: isDisabled,
        loading: isQuoting || isApproving || isCheckingAllowance,
        isTxPending: isApproving,
      },
    })
  }, [
    amountIn,
    isAmountOverBalance,
    isWrbtcSpendShortage,
    amountOut,
    isQuoting,
    isQuoteExpired,
    isApproving,
    isCheckingAllowance,
    isAllowanceEnough,
    handleContinue,
    setButtonActions,
    quote,
  ])

  const handleAmountChange = useCallback(
    (value: string) => {
      // Only process if user is actively typing in this field
      // Ignore programmatic changes from NumericFormat when quote updates the value prop
      if (activeFieldRef.current !== 'in') return
      setAmountIn(handleAmountInput(value))
    },
    [setAmountIn],
  )

  const handleAmountOutChange = useCallback(
    (value: string) => {
      // Only process if user is actively typing in this field
      if (activeFieldRef.current !== 'out') return
      setAmountOut(handleAmountInput(value))
    },
    [setAmountOut],
  )

  // Track which field user is editing to prevent quote updates from triggering handlers
  const handleInputFocus = useCallback(() => {
    activeFieldRef.current = 'in'
  }, [])

  const handleOutputFocus = useCallback(() => {
    activeFieldRef.current = 'out'
  }, [])

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const calculatedAmount = Big(tokenInBalance).mul(percentage).toString()
      setAmountIn(calculatedAmount)
    },
    [tokenInBalance, setAmountIn],
  )

  const feeTierOptions = useMemo(() => {
    const allOptions = buildFeeTierOptions()
    return allOptions.filter(option => {
      if (option.value === AUTO_FEE_TIER) return true
      const tier = Number(option.value)
      return availableFeeTiers.some(f => f === tier)
    })
  }, [availableFeeTiers])

  const selectedToken: SwapInputToken = useMemo(
    () => ({
      symbol: tokenInData.symbol,
      address: tokenInData.address,
      name: tokenInData.name,
      decimals: tokenInData.decimals || 6,
      price: tokenInPrice || undefined,
    }),
    [tokenInData, tokenInPrice],
  )

  // Token for output (readonly)
  const outputToken: SwapInputToken = useMemo(
    () => ({
      symbol: tokenOutData.symbol,
      address: tokenOutData.address,
      name: tokenOutData.name,
      decimals: tokenOutData.decimals || 18,
      price: tokenOutPrice || undefined,
    }),
    [tokenOutData, tokenOutPrice],
  )

  const showLowLiquidityWarning = useMemo(
    () => shouldShowLowLiquidityWarning(amountIn ?? '', amountOut ?? '', selectedToken, outputToken),
    [amountIn, amountOut, selectedToken, outputToken],
  )

  /** In Auto mode, show actual routing fees (per-hop if the winning combo is mixed). */
  const poolFeeAutoHint = useMemo(() => {
    if (selectedFeeTier !== null || activeFeeTier === null) return ''
    const hops = quote?.hopFees
    if (!hops?.length) {
      return ` (${feeTierToPercent(activeFeeTier)}%)`
    }
    const allSame = hops.every(f => f === hops[0])
    if (allSame) {
      return ` (${feeTierToPercent(hops[0])}%)`
    }
    return ` (${hops.map(t => `${feeTierToPercent(t)}%`).join(' → ')} per hop)`
  }, [selectedFeeTier, activeFeeTier, quote?.hopFees])

  const isMultihopRoute = useMemo(() => Boolean(quote?.hopFees && quote.hopFees.length > 1), [quote?.hopFees])

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* "Amount to swap" - user can type here to specify exact input */}
        <SwapInputComponent
          ref={inputRef}
          tokens={selectableSwapTokens}
          selectedToken={selectedToken}
          onTokenChange={handleTokenInChange}
          amount={displayAmountIn}
          onAmountChange={handleAmountChange}
          onFocus={handleInputFocus}
          balance={formatForDisplay(tokenInBalance)}
          labelText="Amount to swap"
          isLoading={isQuoting && mode === 'exactOut'}
          errorText={
            isWrbtcSpendShortage
              ? 'This swap spends WrBTC only. Wrap native rBTC in your wallet first, or enter an amount up to your WrBTC balance.'
              : isAmountOverBalance
                ? `This is more than your available ${tokenInData.symbol} balance. Please adjust the amount to swap, or transfer more ${tokenInData.symbol} into your wallet so you can swap it.`
                : ''
          }
        />

        {tokenInBalance && Big(tokenInBalance).gt(0) && (
          <div className="flex flex-col gap-3 mx-3 -mt-2 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-1">
              <Label variant="body-s" className="text-text-60">
                % of balance
              </Label>
              <PercentageButtons onPercentageClick={handlePercentageClick} testId="swap-percentage-buttons" />
            </div>
            <div className="flex flex-col gap-1 md:items-end">
              <Label variant="body-s" className="text-text-60">
                Pool fee
                {poolFeeAutoHint}
              </Label>
              {isMultihopRoute && (
                <span
                  className="text-text-50 text-xs font-normal max-w-[220px] text-right leading-snug"
                  data-testid="swap-route-bridge-hint"
                >
                  Route includes USDT0
                </span>
              )}
              <PercentageButtons
                options={feeTierOptions}
                value={selectedFeeTier === null ? AUTO_FEE_TIER : String(selectedFeeTier)}
                onPercentageClick={(value: string) =>
                  setSelectedFeeTier(value === AUTO_FEE_TIER ? null : Number(value))
                }
                testId="swap-fee-tier-buttons"
              />
            </div>
          </div>
        )}

        <div className="flex justify-center -my-2">
          <button
            onClick={() => {
              const previousAmountOut = amountOut
              toggleTokenSelection()
              if (previousAmountOut) {
                setAmountIn(previousAmountOut)
              }
            }}
            aria-label="Switch swap direction"
            className="p-2 rounded-full hover:bg-input-bg transition-colors"
          >
            <ArrowsUpDown size={20} />
          </button>
        </div>

        {/* "You will receive" - user can also type here to specify exact output */}
        <SwapInputComponent
          tokens={selectableSwapTokens}
          selectedToken={outputToken}
          onTokenChange={handleTokenOutChange}
          amount={displayAmountOut}
          onAmountChange={handleAmountOutChange}
          onFocus={handleOutputFocus}
          balance={formatForDisplay(tokenOutBalance)}
          labelText="You will receive"
          isLoading={isQuoting && mode === 'exactIn'}
          errorText={quoteError ? 'Failed to get quote. Pool may have insufficient liquidity.' : ''}
          autoFocus={false}
        />

        {(tokenIn === WRBTC || tokenOut === WRBTC) && (
          <SwapStepWarning
            message="You send and receive WrBTC (wrapped), not native rBTC. Unwrap WrBTC separately if you need native coin."
            className="mt-2"
            testId="swap-wrbtc-copy-warning"
          />
        )}

        {showLowLiquidityWarning && (
          <SwapStepWarning
            message={LOW_LIQUIDITY_WARNING_MESSAGE}
            className="mt-2"
            testId="swap-low-liquidity-warning"
          />
        )}
      </div>
    </>
  )
}
