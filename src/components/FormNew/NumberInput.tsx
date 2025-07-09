import { ErrorMessage } from './ErrorMessage'
import { FloatingLabel } from './FloatingLabel'
import { cn } from '@/lib/utils'
import { NumericFormat, NumericFormatProps } from 'react-number-format'

interface Props extends NumericFormatProps {
  label: string
  errorMsg?: string
}

export function NumberInput({ label, className, value = '', errorMsg, ...props }: Props) {
  return (
    <ErrorMessage errorMsg={errorMsg}>
      <FloatingLabel hasValue={!!value} label={label}>
        <NumericFormat
          value={value}
          thousandSeparator=","
          allowLeadingZeros={false}
          allowNegative={false}
          decimalScale={0}
          className={cn(
            'w-full h-16 px-4 pt-4 bg-bg-60 rounded-sm text-text-100 focus:outline-none font-rootstock-sans flex justify-end items-end',
            className,
          )}
          {...props}
        />
      </FloatingLabel>
    </ErrorMessage>
  )
}
