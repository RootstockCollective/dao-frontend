import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'
import { FloatingLabel } from './FloatingLabel'
import { ErrorMessage } from './ErrorMessage'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  errorMsg?: string
}

export function TextInput({ label, errorMsg, className, ...props }: Props) {
  return (
    <ErrorMessage errorMsg={errorMsg}>
      <FloatingLabel hasValue={!!props.value} label={label}>
        <input
          type="text"
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
