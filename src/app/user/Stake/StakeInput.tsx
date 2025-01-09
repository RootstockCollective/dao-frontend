import { Input } from '@/components/Input'

interface Props {
  onChange: (value: string) => void
  value: string
  symbol?: string
  labelText: string
}

export const StakeInput = ({ onChange, value, symbol = 'RIF', labelText }: Props) => {
  return (
    <Input
      type="number"
      label={labelText}
      placeholder={`${symbol} Amount`}
      onChange={onChange}
      value={value}
      name="amount-stake"
      fullWidth
      inputProps={{ decimalScale: 18 }}
    />
  )
}
