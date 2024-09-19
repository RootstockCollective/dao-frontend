import { cn } from '@/lib/utils'
import React from 'react'
import { InputAttributes, NumericFormatProps } from 'react-number-format'
import { useFormField } from '.'
import { FORM_INPUT_DEFAULT_CLASSES } from './FormInput'
import { InputNumber } from '../Input/InputNumber'

interface Props extends NumericFormatProps<InputAttributes> {
  prefix?: string
  decimalScale?: number
}

const FormInputNumber = React.forwardRef<NumericFormatProps<InputAttributes>, Props>(
  ({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField()
    return (
      <InputNumber
        {...props}
        id={formItemId}
        getInputRef={ref}
        className={cn(FORM_INPUT_DEFAULT_CLASSES, error && 'border-st-error focus-visible:ring-0', className)}
      />
    )
  },
)

FormInputNumber.displayName = 'FormInputNumber'

export { FormInputNumber }
