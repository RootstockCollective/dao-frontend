import { Input } from '@/components/Input'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { variantClasses } from '@/components/Typography/Typography'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { forwardRef } from 'react'

interface Props {
  onChange: (value: string) => void
  value: string
  symbol: string
  labelText?: string
  currencyValue?: string
  errorText?: string
}

export const VaultInput = forwardRef<HTMLInputElement, Props>(
  ({ onChange, value, symbol, labelText, currencyValue, errorText }, ref) => {
    return (
      <div className="flex flex-col py-3 px-4 rounded-1 w-full bg-bg-60">
        {labelText && (
          <Paragraph className="mb-3" data-testid="LabelText">
            {labelText}
          </Paragraph>
        )}
        <div className="flex gap-2">
          <Input
            ref={ref}
            name="amount-vault"
            type="number"
            value={value}
            onChange={onChange}
            className={cn('grow', variantClasses.h1, errorText ? 'text-error' : '')}
            data-testid="AmountInput"
            placeholder="0"
            inputProps={{ decimalScale: 18 }}
          />
          <div className="flex items-center gap-1 shrink-0">
            <TokenImage symbol={symbol} size={24} />
            <Paragraph variant="body-l" bold data-testid="Symbol">
              {symbol}
            </Paragraph>
          </div>
        </div>
        {currencyValue && (
          <Paragraph variant="body-s" className="text-bg-0" data-testid="CurrencyValue">
            {currencyValue}
          </Paragraph>
        )}
        {errorText && (
          <div className="flex items-center gap-2 mt-2">
            <Image src="/images/warning-icon.svg" alt="Warning" width={40} height={40} />
            <Paragraph className="text-error" data-testid="ErrorText">
              {errorText}
            </Paragraph>
          </div>
        )}
      </div>
    )
  },
)

VaultInput.displayName = 'VaultInput'
