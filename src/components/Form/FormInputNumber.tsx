import { cn } from '@/lib/utils'
import React from 'react'
import { InputAttributes, NumericFormat, NumericFormatProps } from 'react-number-format'
import { useFormField } from '.'
import { FORM_INPUT_DEFAULT_CLASSES } from './FormInput'

interface FormInputNumber extends NumericFormatProps<InputAttributes> {
  prefix?: string
  decimalScale?: number
}

const FormInputNumber = React.forwardRef<NumericFormatProps<InputAttributes>, FormInputNumber>(
  ({ prefix, decimalScale = 8, className, type, max = Number.MAX_SAFE_INTEGER, ...props }, ref) => {
    const { error, formItemId } = useFormField()
    return (
      <NumericFormat
        id={formItemId}
        className={cn(FORM_INPUT_DEFAULT_CLASSES, error && 'border-st-error focus-visible:ring-0', className)}
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

FormInputNumber.displayName = 'FormInputNumber'

export { FormInputNumber }
