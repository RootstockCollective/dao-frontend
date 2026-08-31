'use client'

import Image from 'next/image'
import { ReactNode, useEffect, useRef } from 'react'

import { Input } from '@/components/Input'
import { PercentageButtons } from '@/components/PercentageButtons'
import { TokenImage } from '@/components/TokenImage'
import { Label } from '@/components/Typography'
import { variantClasses } from '@/components/Typography/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  amount: string
  balanceFormatted: string
  tokenSymbol: string
  onAmountChange: (value: string) => void
  onPercentageClick: (percentage: number) => void
  /** Formatted token amount; shown in the title row as "Max: …" when set. */
  maxDepositableFormatted?: string
  usdEquivalent?: string
  errorMessage?: string
  tokenSelector?: ReactNode
}

/**
 * Presentational amount input card reusable across fund-manager CTA flows.
 * Receives all data via props — no internal data fetching.
 */
export const AmountInputSection = ({
  title,
  amount,
  balanceFormatted,
  tokenSymbol,
  onAmountChange,
  onPercentageClick,
  maxDepositableFormatted,
  usdEquivalent,
  errorMessage,
  tokenSelector,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div data-testid="AmountInputSection">
      <div className="flex flex-col py-3 px-4 rounded w-full bg-bg-60">
        <div className="flex justify-between items-start gap-2 mb-3">
          <Label>{title}</Label>
          {maxDepositableFormatted !== undefined && maxDepositableFormatted !== '' && (
            <Label
              variant="body-s"
              className="text-text-60 shrink-0 text-right"
              data-testid="MaxDepositableLabel"
            >
              Max: {maxDepositableFormatted} {tokenSymbol}
            </Label>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            name="amount-fund-manager"
            type="number"
            value={amount}
            onChange={onAmountChange}
            className={cn(variantClasses.h1, errorMessage ? 'text-error' : '')}
            data-testid="AmountInput"
            placeholder="0"
            inputProps={{ decimalScale: 18 }}
          />
          {tokenSelector ?? (
            <div className="flex items-center gap-1 shrink-0">
              <TokenImage symbol={RBTC} size={24} />
              <Label variant="body-l" bold>
                {tokenSymbol}
              </Label>
            </div>
          )}
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

      <div className="flex justify-between items-center mx-3 my-2">
        <div className="flex items-center gap-1">
          <TokenImage symbol={RBTC} size={16} />
          <Label variant="body-s" className="text-text-60" data-testid="WalletBalanceLabel">
            {tokenSymbol} balance: {balanceFormatted}
          </Label>
        </div>
        <PercentageButtons onPercentageClick={onPercentageClick} testId="PercentageButtons" />
      </div>
    </div>
  )
}
