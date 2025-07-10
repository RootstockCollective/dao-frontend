import { useId, useState } from 'react'
import { ErrorMessage } from './ErrorMessage'
import { FloatingLabel } from './FloatingLabel'
import { cn } from '@/lib/utils'
import { NumericFormat, NumericFormatProps } from 'react-number-format'

interface Props extends NumericFormatProps {
  label: string
  errorMsg?: string
}

export function NumberInput({ id, label, className, value, errorMsg, onBlur, onFocus, ...props }: Props) {
  const [isFocused, setIsFocused] = useState(false)
  const ownId = useId()
  const newId = id ?? ownId
  return (
    <ErrorMessage errorMsg={errorMsg}>
      <FloatingLabel htmlFor={newId} isFloating={isFocused || !!value} label={label}>
        <NumericFormat
          id={newId}
          value={value}
          thousandSeparator=","
          allowLeadingZeros={false}
          allowNegative={false}
          autoComplete="off"
          className={cn(
            'w-full h-16 px-4 pt-4 bg-bg-60 rounded-sm text-text-100 focus:outline-none font-rootstock-sans flex justify-end items-end overflow-hidden',
            className,
          )}
          onFocus={e => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={e => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          {...props}
        />
      </FloatingLabel>
    </ErrorMessage>
  )
}
