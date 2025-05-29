import { Label } from '@/components/TypographyNew'
import { FC } from 'react'
import { RIFToken } from '../RIFToken/RIFToken'

interface CurrentBackingProps {
  existentAllocation: number
}

export const CurrentBacking: FC<CurrentBackingProps> = ({ existentAllocation }) => {
  return (
    <div className="px-3 mb-3 font-rootstock-sans" data-testid="currentBackingContainer">
      {/* FIXME: variables to moved in the variables file */}
      <Label className="text-xs text-v3-text-60" data-testid="currentBackingLabel">
        Current backing
      </Label>
      <div className="flex gap-2 text-xs">
        <span className="text-[16px]" data-testid="currentBackingValue">
          {existentAllocation}
        </span>{' '}
        <RIFToken />
      </div>
    </div>
  )
}
