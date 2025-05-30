import { ReactNode } from 'react'
import { Paragraph } from '@/components/TypographyNew'
import { InputNew } from '@/components/Input'
import { variantClasses } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'

interface Props {
  onChange: (value: string) => void
  value: string
  symbol: string
  labelText?: string
  currencyValue?: string
  icon?: ReactNode
  error?: ReactNode
}

/**
 * @param onChange
 * @param value
 * @param symbol
 * @param labelText
 * @param currencyValue
 * @param error this can be a string or a ReactNode. It should be accompanied by a red icon per design - out of scope
 * @constructor
 */
export const StakeInput = ({ onChange, value, symbol, labelText, currencyValue, error }: Props) => {
  return (
    <div className="flex flex-col py-[12px] px-[16px] rounded-[4px] w-full bg-bg-60">
      {labelText && <Paragraph className="mb-[12px]">{labelText}</Paragraph>}
      <div className="flex gap-2">
        <InputNew
          name="amount-stake"
          type="number"
          value={value}
          onChange={onChange}
          classes={`grow ${variantClasses.h1} ${error ? 'text-error' : 'text-bg-0'}`}
          placeholder="0"
        />
        <div className="flex flex-row gap-x-[4px] items-center">
          <TokenImage symbol={symbol} size={24} />
          <Paragraph variant="body-l" bold>
            {symbol}
          </Paragraph>
        </div>
      </div>
      {currencyValue && (
        <div>
          <Paragraph variant="body-s" bold className="text-bg-0">
            {currencyValue}
          </Paragraph>
        </div>
      )}
      {error}
    </div>
  )
}
