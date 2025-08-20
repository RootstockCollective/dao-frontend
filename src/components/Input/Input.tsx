import { cn } from '@/lib/utils'
import { JSX, forwardRef } from 'react'
import { InputAttributes, NumericFormatProps } from 'react-number-format'
import { InputNumber } from './InputNumber'

type InputType = 'text' | 'number' | 'search'
interface InputProps {
  name: string
  value?: string
  placeholder?: string
  readonly?: boolean
  inputProps?: JSX.IntrinsicElements['input'] & NumericFormatProps<InputAttributes>
  className?: string
  type?: InputType
  onChange?: (value: string) => void
}

/**
 * Input component from the new design system May 2025
 * This is a simplified version of the Input component
 * It only contains the input field without the label, hint, or error message.
 * Should replace the map in the Input component in the future like input[type]
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, className, placeholder, value, onChange, name, readonly, inputProps }, ref) => {
    switch (type) {
      case 'number':
        return (
          <InputNumber
            ref={ref}
            className={cn('focus:outline-hidden w-full', className)}
            placeholder={placeholder}
            value={value}
            onValueChange={({ value }) => onChange?.(value)}
            name={name}
            data-testid={`Input_${name}`}
            readOnly={readonly}
            {...inputProps}
          />
        )
      case 'text':
        return <p>Not implemented</p>
      case 'search':
        return <p>Not implemented</p>
      default:
        return <p>Default case not implemented</p>
    }
  },
)

Input.displayName = 'Input'
