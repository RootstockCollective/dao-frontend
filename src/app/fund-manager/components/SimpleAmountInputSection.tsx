'use client'

import Image from 'next/image'
import { ReactNode, useEffect, useRef } from 'react'

import { Input } from '@/components/Input'
import { TokenImage } from '@/components/TokenImage'
import { Label } from '@/components/Typography'
import { variantClasses } from '@/components/Typography/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  amount: string
  tokenSymbol: string
  onAmountChange: (value: string) => void
  usdEquivalent?: string
  errorMessage?: string
  /** Optional right slot (defaults to token icon + symbol) */
  tokenAffix?: ReactNode
  'data-testid'?: string
}

/**
 * Compact amount field for fund-manager flows: label, large numeric input, optional USD line.
 * No balance row, percentage shortcuts, or token selector — use `AmountInputSection` for those.
 *
 * @remarks Future consolidation: this pattern duplicates logic/layout also found in
 * `src/app/vault/components/VaultInput.tsx`, `src/app/user/Stake/StakeInput/StakeInput.tsx`,
 * and the inner card (above the balance row) of `AmountInputSection.tsx`.
 * Merge these into a single shared presentational component under `src/components/` when feasible.
 */
export const SimpleAmountInputSection = ({
  title,
  amount,
  tokenSymbol,
  onAmountChange,
  usdEquivalent,
  errorMessage,
  tokenAffix,
  'data-testid': dataTestId = 'SimpleAmountInputSection',
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div data-testid={dataTestId}>
      <div className="flex flex-col py-3 px-4 rounded w-full bg-bg-60">
        <Label className="mb-3">{title}</Label>
        <div className="flex gap-2 items-center min-h-10">
          <Input
            ref={inputRef}
            name="simple-amount-fund-manager"
            type="number"
            value={amount}
            onChange={onAmountChange}
            className={cn('grow min-w-0', variantClasses.h1, errorMessage ? 'text-error' : '')}
            data-testid="SimpleAmountInput"
            placeholder="0"
            inputProps={{ decimalScale: 18 }}
          />
          {tokenAffix ?? (
            <div className="flex items-center gap-1 shrink-0 py-2 pl-2 rounded-sm">
              <TokenImage symbol={RBTC} size={24} />
              <Label variant="body-l" bold>
                {tokenSymbol}
              </Label>
            </div>
          )}
        </div>

        {usdEquivalent && (
          <Label variant="body-s" className="text-text-60 mt-2" data-testid="SimpleUsdEquivalent">
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
            <Label className="text-error wrap-break-word" data-testid="SimpleAmountErrorText">
              {errorMessage}
            </Label>
          </div>
        )}
      </div>
    </div>
  )
}
