import { cn } from '@/lib/utils'
import React from 'react'
import { NumericFormat } from 'react-number-format'
import { useFormField } from '../Form'
import { INPUT_DEFAULT_CLASSES } from './Input'

interface InputNumberProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string
  decimalScale?: number
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  ({ prefix, decimalScale = 8, className, type, max = Number.MAX_SAFE_INTEGER, ...props }, ref) => {
    const { error, formItemId } = useFormField()
    return (
      <NumericFormat
        id={formItemId}
        className={cn(INPUT_DEFAULT_CLASSES, error && 'border-st-error focus-visible:ring-0', className)}
        getInputRef={ref}
        decimalSeparator="."
        prefix={prefix}
        decimalScale={decimalScale}
        allowNegative={false}
        isAllowed={({ floatValue }) => !floatValue || floatValue <= Number(max)}
        {...props}
      />
    )
  },
)

InputNumber.displayName = 'InputNumber'

export { InputNumber }
