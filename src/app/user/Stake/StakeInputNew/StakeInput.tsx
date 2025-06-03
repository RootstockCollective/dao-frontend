import { ReactNode } from 'react'
import { Paragraph, Span } from '@/components/TypographyNew'
import { InputNew } from '@/components/Input'
import { variantClasses } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface Props {
  onChange: (value: string) => void
  value: string
  symbol: string
  labelText?: string
  currencyValue?: string
  icon?: ReactNode
  errorText?: string
  decimalScale?: number
}

/**
 * @param onChange
 * @param value
 * @param symbol
 * @param labelText
 * @param currencyValue
 * @param errorText
 * @param decimalScale
 * @constructor
 */
export const StakeInput = ({
  onChange,
  value,
  symbol,
  labelText,
  currencyValue,
  errorText,
  decimalScale,
}: Props) => {
  return (
    <div className="flex flex-col py-[12px] px-[16px] rounded-[4px] w-full bg-bg-60">
      {labelText && <Paragraph className="mb-[12px]">{labelText}</Paragraph>}
      <div className="flex gap-2">
        <InputNew
          name="amount-stake"
          type="number"
          value={value}
          onChange={onChange}
          className={cn('grow', variantClasses.h1, errorText ? 'text-error' : 'text-bg-0')}
          placeholder="0"
          inputProps={{ decimalScale }}
        />
        <div className="flex flex-row gap-x-[4px] items-center">
          <TokenImage symbol={symbol} size={24} />
          <Paragraph variant="body-l" bold>
            {symbol}
          </Paragraph>
        </div>
      </div>
      {currencyValue && (
        <Paragraph variant="body-s" className="text-bg-0">
          {currencyValue}
        </Paragraph>
      )}
      {errorText && (
        <div className="flex items-center gap-2 mt-2">
          <Image src="/images/warning-icon.svg" alt="Warning" width={40} height={40} />
          <Span className="text-error">{errorText}</Span>
        </div>
      )}
    </div>
  )
}
