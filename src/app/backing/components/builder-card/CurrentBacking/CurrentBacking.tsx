import { Label } from '@/components/TypographyNew'
import { FC } from 'react'
import { RIFToken } from '../RIFToken/RIFToken'

interface CurrentBackingProps {
  currentAllocation: number
}

export const CurrentBacking: FC<CurrentBackingProps> = ({ currentAllocation }) => {
  return (
    <div className="px-3 mb-3 font-rootstock-sans" data-testid="currentBackingContainer">
      <Label className="text-xs text-[#B0B0B0]" data-testid="currentBackingLabel">
        Current backing
      </Label>
      <div className="flex gap-1 text-xs">
        <span className="text-[16px]" data-testid="currentBackingValue">
          {currentAllocation}
        </span>{' '}
        <RIFToken />
      </div>
    </div>
  )
}
