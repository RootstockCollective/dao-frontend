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

export type WithdrawType = 'partial' | 'full'

const PERCENTAGE_OPTIONS: PercentageButtonItem<number>[] = [
  { value: 0.25, label: '25%', testId: '25Button' },
  { value: 0.5, label: '50%', testId: '50Button' },
  { value: 0.75, label: '75%', testId: '75Button' },
  { value: 1, label: 'Max', testId: 'MaxButton' },
]

interface WithdrawAmountStepProps {
  amount: string
  setAmount: (value: string) => void
  slippage: string
  setSlippage: (value: string) => void
  withdrawType: WithdrawType
  setWithdrawType: (type: WithdrawType) => void
  vaultTokensFormatted: string
  vaultTokensRaw: bigint
  rbtcEquivalent: string
  onNext: () => void
}

export const WithdrawAmountStep = ({
  amount,
  setAmount,
  slippage,
  setSlippage,
  withdrawType,
  setWithdrawType,
  vaultTokensFormatted,
  vaultTokensRaw,
  rbtcEquivalent,
  onNext,
}: WithdrawAmountStepProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (withdrawType === 'partial') {
      inputRef.current?.focus()
    }
  }, [withdrawType])

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(handleAmountInput(value))
    },
    [setAmount],
  )

  const handleSelectPartial = useCallback(() => {
    setWithdrawType('partial')
    setAmount('')
  }, [setWithdrawType, setAmount])

  const handleSelectFull = useCallback(() => {
    setWithdrawType('full')
    // Auto-fill with full vault token balance (no gas reserve — ERC-20)
    const maxStr = Big(vaultTokensRaw.toString()).div(Big(10).pow(18)).toString()
    setAmount(maxStr)
  }, [setWithdrawType, setAmount, vaultTokensRaw])

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      // No gas reserve needed for ERC-20 vault tokens
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
      return 'This is more than your available vault token balance. Please update the amount.'
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
      {/* Partial / Full toggle */}
      <div className="flex gap-2 mb-4" data-testid="WithdrawTypeToggle">
        <Button
          variant={withdrawType === 'partial' ? 'primary' : 'secondary'}
          onClick={handleSelectPartial}
          data-testid="PartialButton"
        >
          Partial
        </Button>
        <Button
          variant={withdrawType === 'full' ? 'primary' : 'secondary'}
          onClick={handleSelectFull}
          data-testid="FullButton"
        >
          Full
        </Button>
      </div>

      <div className="flex flex-col py-3 px-4 rounded-1 w-full bg-bg-60">
        <Label className="mb-3" data-testid="LabelText">
          Amount to withdraw
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
            readonly={withdrawType === 'full'}
          />
          <div className="flex items-center gap-1 shrink-0">
            <Label variant="body-l" bold data-testid="Symbol">
              Vault Tokens
            </Label>
          </div>
        </div>

        {amount && (
          <Label variant="body-s" className="text-text-60 mt-1" data-testid="RbtcEquivalent">
            ≈ {rbtcEquivalent} {RBTC}
          </Label>
        )}

        <SlippageInput value={slippage} onChange={setSlippage} name="slippage-btc-withdraw-input" />

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
            <Label variant="body-s" className="text-text-60" data-testid="VaultBalanceLabel">
              Your Vault Balance: {vaultTokensFormatted} Vault Tokens
            </Label>
          </div>
        </div>
        {withdrawType === 'partial' && (
          <div className="flex gap-1 self-end">
            <PercentageButtons
              onPercentageClick={handlePercentageClick}
              options={PERCENTAGE_OPTIONS}
              testId="PercentageButtons"
            />
          </div>
        )}
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
