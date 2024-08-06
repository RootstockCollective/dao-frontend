import { FC } from 'react'
import { InputAttributes, NumericFormat, NumericFormatProps } from 'react-number-format'

const MAX_INPUT_NUMBER_AMOUNT = 999999999

interface Props extends NumericFormatProps<InputAttributes> {
  prefix?: string
  decimalScale?: number
}

export const InputNumber: FC<Props> = ({
  prefix,
  decimalScale = 8,
  max = MAX_INPUT_NUMBER_AMOUNT,
  ...props
}) => (
  <NumericFormat
    decimalSeparator="."
    prefix={prefix}
    decimalScale={decimalScale}
    allowNegative={false}
    isAllowed={({ floatValue }) => !floatValue || floatValue <= Number(max)}
    {...props}
  />
)
