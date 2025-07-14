import * as RadioGroup from '@radix-ui/react-radio-group'
import { FC, ReactNode } from 'react'
import { ClaimRewardType } from './types'
import { ClaimRewardRadioOption } from './ClaimRewardRadioOption'

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
      className={`flex gap-2 w-full ${className || ''}`}
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
