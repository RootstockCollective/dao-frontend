import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Typography } from '@/components/TypographyNew/Typography'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { FC, ReactNode } from 'react'
import { ClaimRewardType } from './types'

interface ClaimRewardRadioOptionProps {
  value: ClaimRewardType
  label: ReactNode
  subLabel: ReactNode
  isLoading?: boolean
}

export const ClaimRewardRadioOption: FC<ClaimRewardRadioOptionProps> = ({
  value,
  label,
  subLabel,
  isLoading,
}) => {
  return (
    <RadioGroup.Item
      value={value}
      className="flex-1 rounded border-1 border-[v3-text-100] px-3 py-4 flex flex-col items-start gap-2 data-[state=checked]:border-t-4 data-[state=checked]:pt-[13px] focus:outline-none cursor-pointer"
    >
      {isLoading ? (
        <div className="flex justify-center items-center w-full py-2">
          <LoadingSpinner size="small" />
        </div>
      ) : (
        <div className="flex flex-row items-start gap-3 w-full">
          <span className="w-5 h-5 aspect-square rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
            <RadioGroup.Indicator className="w-full h-full rounded-full border-4 border-white" />
          </span>
          <div className="flex flex-col items-start gap-2 justify-start text-left w-full">
            <Typography variant="h3">{label}</Typography>
            <Typography variant="body" className="text-v3-bg-accent-0">
              {subLabel}
            </Typography>
          </div>
        </div>
      )}
    </RadioGroup.Item>
  )
}
