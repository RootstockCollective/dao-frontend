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

import { BTC_VAULT_WITHDRAWAL_DISCLAIMER } from '../services/constants'

interface WithdrawAmountStepProps {
  amount: string
  setAmount: (value: string) => void
  vaultTokensFormatted: string
  vaultTokensRaw: bigint
  rbtcEquivalent: string
  withdrawalFee: string
  onNext: () => void | Promise<void>
  /** When true, Continue is disabled and shows a pending state (e.g. allowance check). */
  isContinuePending?: boolean
}

export const WithdrawAmountStep = ({
  amount,
  setAmount,
  vaultTokensFormatted,
  vaultTokensRaw,
  rbtcEquivalent,
  withdrawalFee,
  isContinuePending = false,
  onNext,
}: WithdrawAmountStepProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { prices } = usePricesContext()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const rbtcPrice = prices[RBTC]?.price ?? 0

  const usdEquivalent = useMemo(() => {
    if (!rbtcEquivalent || rbtcEquivalent === '0' || !rbtcPrice) return ''
    try {
      return formatCurrency(Big(rbtcPrice).mul(rbtcEquivalent), { showCurrencyLabel: true })
    } catch {
      return ''
    }
  }, [rbtcEquivalent, rbtcPrice])

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(handleAmountInput(value))
    },
    [setAmount],
  )

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const balanceStr = Big(vaultTokensRaw.toString()).div(Big(10).pow(18)).toString()
      const calculatedAmount = Big(balanceStr).mul(percentage).toString()
      setAmount(calculatedAmount)
    },
    [vaultTokensRaw, setAmount],
  )

  const isAmountOverBalance = useMemo(() => {
    if (!amount || amount === '0') return false
    try {
      const amountWei = Big(amount).mul(Big(10).pow(18))
      return amountWei.gt(Big(vaultTokensRaw.toString()))
    } catch {
      return false
    }
  }, [amount, vaultTokensRaw])

  const errorMessage = useMemo(() => {
    if (isAmountOverBalance) {
      return 'This is more than your available shares balance. Please update the amount.'
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
    <div className="flex-1 flex flex-col" data-testid="WithdrawAmountStep">
      {/* --- Amount Input Card --- */}
      <div className="flex flex-col py-3 px-4 rounded-1 w-full bg-bg-60">
        <Label className="mb-3" data-testid="LabelText">
          No. of shares to withdraw
        </Label>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            name="amount-btc-vault-withdraw"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className={cn('grow', 'text-2xl font-bold', errorMessage ? 'text-error' : '')}
            data-testid="AmountInput"
            placeholder="0"
            inputProps={{ decimalScale: 18 }}
          />
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
        <Label variant="body-s" className="text-text-60" data-testid="SharesBalanceLabel">
          Shares balance: {vaultTokensFormatted}
        </Label>
        <PercentageButtons onPercentageClick={handlePercentageClick} testId="PercentageButtons" />
      </div>

      {/* --- Redemption Value + Fee --- */}
      <div className="flex gap-10 mt-4 px-3">
        <div className="flex flex-col gap-1" data-testid="review-redemption-value">
          <Label variant="body-s" className="text-text-60">
            Redemption value (est.)
          </Label>
          <div className="flex items-center gap-2">
            <Label variant="body-s" bold>
              {rbtcEquivalent}
            </Label>
            <TokenImage symbol={RBTC} size={16} />
            <Label variant="body-s" bold>
              {RBTC}
            </Label>
          </div>
          {usdEquivalent && (
            <Label variant="body-s" className="text-text-60">
              {usdEquivalent}
            </Label>
          )}
        </div>
        <div className="flex flex-col gap-1" data-testid="review-fee">
          <Label variant="body-s" className="text-text-60">
            Redemption fee
          </Label>
          <Label variant="body-s" bold>
            {withdrawalFee}%
          </Label>
        </div>
      </div>

      {/* --- Footer: Disclaimer + Continue --- */}
      <div className="mt-auto pt-4">
        <Divider />
        <div className="flex justify-between items-center gap-4 pt-4">
          <Paragraph variant="body-s" className="text-text-60 text-xs max-w-[440px]" data-testid="Disclaimer">
            {BTC_VAULT_WITHDRAWAL_DISCLAIMER}
          </Paragraph>
          <Button
            variant="primary"
            onClick={() => void onNext()}
            disabled={!isValid || isContinuePending}
            data-testid="ContinueButton"
          >
            {isContinuePending ? 'Checking...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
