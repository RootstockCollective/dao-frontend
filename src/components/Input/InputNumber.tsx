import { forwardRef } from 'react'
import { InputAttributes, NumericFormat, NumericFormatProps } from 'react-number-format'

export const MAX_INPUT_NUMBER_AMOUNT = 999999999

interface Props extends NumericFormatProps<InputAttributes> {
  prefix?: string
  decimalScale?: number
}

export const InputNumber = forwardRef<HTMLInputElement, Props>(
  ({ prefix, decimalScale = 8, max = MAX_INPUT_NUMBER_AMOUNT, ...props }, ref) => (
    <NumericFormat
      getInputRef={ref}
      decimalSeparator="."
      prefix={prefix}
      decimalScale={decimalScale}
      allowNegative={false}
      isAllowed={({ floatValue }) => !floatValue || floatValue <= Number(max)}
      {...props}
    />
  ),
)

InputNumber.displayName = 'InputNumber'
