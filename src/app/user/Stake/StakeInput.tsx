import { TextInput } from '@/components/TextInput/TextInput'
import { isValidNumber } from '@/lib/utils'

interface Props {
  onChange: (value: string) => void
  value: string
  symbol?: string
  labelText: string
}

export const StakeInput = ({ onChange, value, symbol = 'RIF', labelText }: Props) => {
  const handleChange = (value: string) => {
    if (isValidNumber(value)) {
      onChange(value)
    }
  }
  return (
    <TextInput
      label={labelText}
      placeholder={`${symbol} Amount`}
      onChange={handleChange}
      value={value}
      name="amount-stake"
      fullWidth
    />
  )
}
