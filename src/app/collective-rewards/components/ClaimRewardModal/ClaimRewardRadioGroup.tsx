import * as RadioGroup from '@radix-ui/react-radio-group'
import { FC, ReactNode } from 'react'
import { ClaimRewardRadioOption } from './ClaimRewardRadioOption'
import { ClaimRewardType } from './types'

interface RadioOption {
  value: ClaimRewardType
  label: ReactNode
  subLabel: ReactNode
}

interface ClaimRewardRadioGroupProps {
  value: ClaimRewardType
  onValueChange: (value: ClaimRewardType) => void
  options: RadioOption[]
  isLoading?: boolean
  className?: string
}

export const ClaimRewardRadioGroup: FC<ClaimRewardRadioGroupProps> = ({
  value,
  onValueChange,
  options,
  isLoading = false,
  className,
}) => {
  return (
    <RadioGroup.Root
      className={`flex flex-col md:flex-row gap-2 w-full ${className || ''}`}
      value={value}
      onValueChange={onValueChange}
    >
      {options.map(option => (
        <ClaimRewardRadioOption
          key={option.value}
          value={option.value}
          label={option.label}
          subLabel={option.subLabel}
          isLoading={isLoading}
        />
      ))}
    </RadioGroup.Root>
  )
}
