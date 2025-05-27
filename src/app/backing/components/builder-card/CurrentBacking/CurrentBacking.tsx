import { Label } from '@/components/TypographyNew'
import { TokenImage } from '@/components/TokenImage'
import { RIF } from '@/lib/constants'
import { FC } from 'react'

interface CurrentBackingProps {
  currentAllocation: number
}

export const CurrentBacking: FC<CurrentBackingProps> = ({ currentAllocation }) => {
  const rifToken = (
    <div className="flex items-center gap-1 flex-shrink-0" data-testid="currentBackingToken">
      <TokenImage symbol={RIF} size={16} />
      <div className="text-xs text-white">stRIF</div>
    </div>
  )

  return (
    <div className="px-3 mb-3" data-testid="currentBackingContainer">
      <Label className="text-xs text-[#B0B0B0]" data-testid="currentBackingLabel">
        Current backing
      </Label>
      <div className="flex gap-1 text-xs">
        <span className="text-[16px]" data-testid="currentBackingValue">
          {currentAllocation}
        </span>{' '}
        {rifToken}
      </div>
    </div>
  )
}
