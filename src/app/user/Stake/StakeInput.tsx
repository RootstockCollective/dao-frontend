import { TextInput } from '@/components/TextInput/TextInput'
import { isValidNumber } from '@/app/user/utils'

interface Props {
  onChange: (value: string) => void
  value: string
  symbol?: string
}

export const StakeInput = ({ onChange, value, symbol = 'RIF' }: Props) => {
  const handleChange = (value: string) => {
    if (isValidNumber(value)) {
      onChange(value)
    }
  }
  return (
    <TextInput
      label="Amount to stake"
      placeholder={`${symbol} Amount`}
      onChange={handleChange}
      value={value}
      name="amount-stake"
      fullWidth
    />
  )
}
