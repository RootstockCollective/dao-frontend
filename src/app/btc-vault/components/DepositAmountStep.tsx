'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { SlippageInput } from '@/app/vault/components/SlippageInput'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { PercentageButtonItem, PercentageButtons } from '@/components/PercentageButtons'
import { Label } from '@/components/Typography'
import Big from '@/lib/big'
import { RBTC } from '@/lib/constants'
import { cn, handleAmountInput } from '@/lib/utils'

const PERCENTAGE_OPTIONS: PercentageButtonItem<number>[] = [
  { value: 0.25, label: '25%', testId: '25Button' },
  { value: 0.5, label: '50%', testId: '50Button' },
  { value: 0.75, label: '75%', testId: '75Button' },
  { value: 1, label: 'Max', testId: 'MaxButton' },
]

interface DepositAmountStepProps {
  amount: string
  setAmount: (value: string) => void
  slippage: string
  setSlippage: (value: string) => void
  rbtcBalanceFormatted: string
  rbtcBalanceRaw: bigint
  onNext: () => void
}

export const DepositAmountStep = ({
  amount,
  setAmount,
  slippage,
  setSlippage,
  rbtcBalanceFormatted,
  rbtcBalanceRaw,
  onNext,
}: DepositAmountStepProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(handleAmountInput(value))
    },
    [setAmount],
  )

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const balanceStr = Big(rbtcBalanceRaw.toString()).div(Big(10).pow(18)).toString()
      const calculatedAmount = Big(balanceStr).mul(percentage).toString()
      setAmount(calculatedAmount)
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
            <Label variant="body-l" bold data-testid="Symbol">
              {RBTC}
            </Label>
          </div>
        </div>

        <SlippageInput value={slippage} onChange={setSlippage} name="slippage-btc-deposit-input" />

        {errorMessage && (
          <div className="flex items-start gap-2 mt-2 max-w-full">
            <Image
              src="/images/warning-icon.svg"
              alt="Warning"
              width={24}
              height={24}
              className="shrink-0 mt-1"
            />
            <Label className="text-error break-words" data-testid="ErrorText">
              {errorMessage}
            </Label>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between mx-3 my-2 gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label variant="body-s" className="text-text-60" data-testid="WalletBalanceLabel">
              Your Wallet Balance: {rbtcBalanceFormatted} {RBTC}
            </Label>
          </div>
        </div>
        <div className="flex gap-1 self-end">
          <PercentageButtons
            onPercentageClick={handlePercentageClick}
            options={PERCENTAGE_OPTIONS}
            testId="PercentageButtons"
          />
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="flex justify-end">
          <Button variant="primary" onClick={onNext} disabled={!isValid} data-testid="ContinueButton">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
