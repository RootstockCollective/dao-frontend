import { Header, Label } from '@/components/Typography'
import { useEffect, useCallback, useMemo } from 'react'
import { SwapStepProps } from '../types'
import { StakeTokenAmountDisplay } from '@/app/user/Stake/components/StakeTokenAmountDisplay'
import { useSwapInput, useTokenSelection, usePermitSigning } from '@/shared/stores/swap'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import Big from '@/lib/big'
import { parseUnits } from 'viem'

export const SwapStepTwo = ({ onGoNext, onGoBack, setButtonActions }: SwapStepProps) => {
  const { amountIn } = useSwapInput()
  const { tokenInData } = useTokenSelection()
  const { prices } = useBalancesContext()
  const { signPermit, isSigning, permitSignature, permit } = usePermitSigning()

  // Calculate amount in currency using price from context
  const amountInCurrency = useMemo(() => {
    const priceValue = prices[tokenInData.symbol]?.price ?? 0
    return `$${Big(amountIn).times(priceValue).toFixed(2)}`
  }, [amountIn, prices, tokenInData.symbol])

  // Calculate current required amount in bigint
  const requiredAmount = useMemo(() => {
    if (!amountIn || !tokenInData.decimals) return 0n
    try {
      return parseUnits(amountIn, tokenInData.decimals)
    } catch {
      return 0n
    }
  }, [amountIn, tokenInData.decimals])

  // Check if existing permit covers the current amount
  // Permit is sufficient if: we have a signature AND the signed amount >= current amount
  const isPermitSufficient = useMemo(() => {
    if (!permitSignature || !permit?.details?.amount || requiredAmount === 0n) {
      return false
    }
    return permit.details.amount >= requiredAmount
  }, [permitSignature, permit, requiredAmount])

  // Handle signing permit
  const handleSignPermit = useCallback(async () => {
    try {
      await signPermit()
      onGoNext()
    } catch (error) {
      // Error is handled by the hook, user likely rejected
      console.error('Permit signing failed:', error)
    }
  }, [signPermit, onGoNext])

  // Auto-advance if existing permit signature covers the current amount
  useEffect(() => {
    if (isPermitSufficient && !isSigning) {
      onGoNext()
    }
  }, [isPermitSufficient, isSigning, onGoNext])

  // Set button actions
  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Sign spending cap',
        onClick: handleSignPermit,
        // Disable if no valid amount, currently signing, or existing permit already covers this amount
        disabled: !amountIn || !Big(amountIn).gt(0) || isSigning || isPermitSufficient,
        loading: isSigning,
      },
      secondary: {
        label: 'Back',
        onClick: onGoBack,
        disabled: isSigning,
        loading: false,
      },
    })
  }, [amountIn, isSigning, isPermitSufficient, handleSignPermit, onGoBack, setButtonActions])

  // At step 2, amountIn should always exist (user came from step 1)
  if (!amountIn) {
    return null
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div className="flex-1 md:max-w-[55%] mb-4 md:mb-0">
          <Label variant="tag" className="text-bg-0">
            Permit2 Spending Cap
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Header variant="h1">Authorize {tokenInData.symbol} spend</Header>
          </div>
        </div>
        <StakeTokenAmountDisplay
          label="Spending cap"
          amount={amountIn}
          tokenSymbol={tokenInData.symbol}
          amountInCurrency={amountInCurrency}
          isFlexEnd
        />
      </div>

      <div className="text-text-60 text-sm">
        This signature authorizes the swap to spend exactly {amountIn} {tokenInData.symbol}. No gas fee is
        required for this step.
      </div>
    </>
  )
}
