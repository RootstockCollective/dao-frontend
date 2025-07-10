import { cn } from '@/lib/utils'
import { useId, useState, type InputHTMLAttributes } from 'react'
import { FloatingLabel } from './FloatingLabel'
import { ErrorMessage } from './ErrorMessage'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  errorMsg?: string
}

export function TextInput({ id, label, errorMsg, className, value, onFocus, onBlur, ...props }: Props) {
  const ownId = useId()
  const newId = id ?? ownId
  const [isFocused, setIsFocused] = useState(false)

  return (
    <ErrorMessage errorMsg={errorMsg}>
      <FloatingLabel htmlFor={newId} isFloating={isFocused || !!value} label={label}>
        <input
          id={newId}
          value={value}
          type="text"
          className={cn(
            'w-full h-16 px-4 pt-4 bg-bg-60 rounded-sm text-text-100 focus:outline-none font-rootstock-sans flex justify-end items-end',
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
