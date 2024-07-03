import { TextInput } from '@/components/TextInput/TextInput'
import { isValidNumber } from '@/app/user/utils'

interface Props {
  onChange: (value: string) => void
  value: string
}
export const StakeInput = ({ onChange, value }: Props) => {
  
  const handleChange = (value: string) => {
    if (isValidNumber(value)) {
      onChange(value)
    }
  }
  return (
    <TextInput
      label='Amount to stake'
      placeholder='RIF Amount'
      onChange={handleChange}
      value={value}
      name='test'
      fullWidth
    />
  )
}