'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { Input } from '@/components/Input'
import { PercentageButtons } from '@/components/PercentageButtons'
import { TokenImage } from '@/components/TokenImage'
import { Label, Paragraph } from '@/components/Typography'
import Big from '@/lib/big'
import { RBTC } from '@/lib/constants'
import { cn, formatCurrency, handleAmountInput } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'

import { BTC_VAULT_DEPOSIT_DISCLAIMER } from '../services/constants'

/** Conservative gas reserve for native rBTC deposits (0.001 rBTC ≈ $0.10) */
const GAS_RESERVE_WEI = 1_000_000_000_000_000n // 0.001 rBTC

interface DepositAmountStepProps {
  amount: string
  setAmount: (value: string) => void
  rbtcBalanceFormatted: string
  rbtcBalanceRaw: bigint
  estimatedShares: string
  depositFee: string
  onNext: () => void
}

export const DepositAmountStep = ({
  amount,
  setAmount,
  rbtcBalanceFormatted,
  rbtcBalanceRaw,
  estimatedShares,
  depositFee,
  onNext,
}: DepositAmountStepProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { prices } = usePricesContext()

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const rbtcPrice = prices[RBTC]?.price ?? 0

  const usdEquivalent = useMemo(() => {
    if (!amount || !rbtcPrice) return ''
    try {
      return formatCurrency(Big(rbtcPrice).mul(amount), { showCurrencyLabel: true })
    } catch {
      return ''
    }
  }, [amount, rbtcPrice])

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(handleAmountInput(value))
    },
    [setAmount],
  )

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      if (percentage === 1) {
        const maxWei = rbtcBalanceRaw > GAS_RESERVE_WEI ? rbtcBalanceRaw - GAS_RESERVE_WEI : 0n
        const maxStr = Big(maxWei.toString()).div(Big(10).pow(18)).toString()
        setAmount(maxStr)
      } else {
        const balanceStr = Big(rbtcBalanceRaw.toString()).div(Big(10).pow(18)).toString()
        const calculatedAmount = Big(balanceStr).mul(percentage).toString()
        setAmount(calculatedAmount)
      }
    },
    [rbtcBalanceRaw, setAmount],
  )

  const isAmountOverBalance = useMemo(() => {
    if (!amount || amount === '0') return false
    try {
      const amountWei = Big(amount).mul(Big(10).pow(18))
      return amountWei.gt(Big(rbtcBalanceRaw.toString()))
    } catch {
      return false
    }
  }, [amount, rbtcBalanceRaw])

  const errorMessage = useMemo(() => {
    if (isAmountOverBalance) {
      return `This is more than the available ${RBTC} balance. Please update the amount.`
    }
    return ''
  }, [isAmountOverBalance])

  const isValid = useMemo(() => {
    if (!amount) return false
    try {
      return Big(amount).gt(0) && !isAmountOverBalance
    } catch {
      return false
    }
  }, [amount, isAmountOverBalance])

  return (
    <div className="flex-1 flex flex-col" data-testid="DepositAmountStep">
      {/* --- Amount Input Card --- */}
      <div className="flex flex-col py-3 px-4 rounded-1 w-full bg-bg-60">
        <Label className="mb-3" data-testid="LabelText">
          Amount to deposit
        </Label>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            name="amount-btc-vault"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className={cn('grow', 'text-2xl font-bold', errorMessage ? 'text-error' : '')}
            data-testid="AmountInput"
            placeholder="0"
            inputProps={{ decimalScale: 18 }}
          />
          <div className="flex items-center gap-1 shrink-0">
            <TokenImage symbol="RBTC" size={24} />
            <Label variant="body-l" bold data-testid="Symbol">
              {RBTC}
            </Label>
          </div>
        </div>

        {usdEquivalent && (
          <Label variant="body-s" className="text-text-60 mt-2" data-testid="UsdEquivalent">
            {usdEquivalent}
          </Label>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2 mt-2 max-w-full">
            <Image
              src="/images/warning-icon.svg"
              alt="Warning"
              width={24}
              height={24}
              className="shrink-0 mt-1"
            />
            <Label className="text-error wrap-break-word" data-testid="ErrorText">
              {errorMessage}
            </Label>
          </div>
        )}
      </div>

      {/* --- Balance + Percentage Buttons --- */}
      <div className="flex justify-between items-center mx-3 my-2">
        <div className="flex items-center gap-1">
          <TokenImage symbol="RBTC" size={16} />
          <Label variant="body-s" className="text-text-60" data-testid="WalletBalanceLabel">
            {RBTC} balance: {rbtcBalanceFormatted}
          </Label>
        </div>
        <PercentageButtons onPercentageClick={handlePercentageClick} testId="PercentageButtons" />
      </div>

      {/* --- Shares Estimate + Fee --- */}
      <div className="flex gap-10 mt-4 px-3">
        <div className="flex flex-col gap-1" data-testid="review-shares">
          <Label variant="body-s" className="text-text-60">
            No. of shares to receive (est.)
          </Label>
          <Label variant="body-s" bold>
            {estimatedShares}
          </Label>
        </div>
        <div className="flex flex-col gap-1" data-testid="review-fee">
          <Label variant="body-s" className="text-text-60">
            Deposit fee
          </Label>
          <Label variant="body-s" bold>
            {depositFee}%
          </Label>
        </div>
      </div>

      {/* --- Footer: Disclaimer + Continue --- */}
      <div className="mt-auto pt-4">
        <Divider />
        <div className="flex justify-between items-center gap-4 pt-4">
          <Paragraph variant="body-s" className="text-text-60 text-xs max-w-[440px]" data-testid="Disclaimer">
            {BTC_VAULT_DEPOSIT_DISCLAIMER}
          </Paragraph>
          <Button variant="primary" onClick={onNext} disabled={!isValid} data-testid="ContinueButton">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
