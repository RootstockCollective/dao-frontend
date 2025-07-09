import { cn } from '@/lib/utils'
import { useId, useState, type InputHTMLAttributes } from 'react'
import { FloatingLabel } from './FloatingLabel'
import { ErrorMessage } from './ErrorMessage'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  errorMsg?: string
}

export function TextInput({ label, errorMsg, className, ...props }: Props) {
  const ownId = useId()
  const id = props.id ?? ownId
  const [isFocused, setIsFocused] = useState(false)

  return (
    <ErrorMessage errorMsg={errorMsg}>
      <FloatingLabel htmlFor={id} isFloating={isFocused || !!props.value} label={label}>
        <input
          id={id}
          type="text"
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
