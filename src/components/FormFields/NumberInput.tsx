import { useId, useState } from 'react'
import { ErrorMessage } from './ErrorMessage'
import { FloatingLabel } from './FloatingLabel'
import { cn } from '@/lib/utils'
import { NumericFormat, NumericFormatProps } from 'react-number-format'

interface Props extends NumericFormatProps {
  label: string
  errorMsg?: string
}

export function NumberInput({ label, className, value = '', errorMsg, ...props }: Props) {
  const [isFocused, setIsFocused] = useState(false)
  const ownId = useId()
  const id = props.id ?? ownId
  return (
    <ErrorMessage errorMsg={errorMsg}>
      <FloatingLabel htmlFor={id} isFloating={isFocused || !!value} label={label}>
        <NumericFormat
          id={id}
          value={value}
          thousandSeparator=","
          allowLeadingZeros={false}
          allowNegative={false}
          decimalScale={0}
          autoComplete="off"
          className={cn(
            'w-full h-16 px-4 pt-4 bg-bg-60 rounded-sm text-text-100 focus:outline-none font-rootstock-sans flex justify-end items-end',
            className,
          )}
          onFocus={e => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={e => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
      </FloatingLabel>
    </ErrorMessage>
  )
}
