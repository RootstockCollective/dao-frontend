import { InputNew } from '@/components/Input'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/TypographyNew'
import { variantClasses } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils/utils'
import Image from 'next/image'

interface Props {
  onChange: (value: string) => void
  value: string
  symbol: string
  labelText?: string
  currencyValue?: string
  errorText?: string
  decimalScale?: number
}

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
    <div className="flex flex-col py-3 px-4 rounded-1 w-full bg-bg-60">
      {labelText && <Paragraph className="mb-3">{labelText}</Paragraph>}
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
        <div className="flex items-center gap-1 shrink-0">
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
          <Paragraph className="text-error">{errorText}</Paragraph>
        </div>
      )}
    </div>
  )
}
