import { Label } from '@/components/TypographyNew'
import { FC } from 'react'
import { RIFToken } from '../RIFToken/RIFToken'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils/formatter'

interface CurrentBackingProps {
  existentAllocation: bigint
}

export const CurrentBacking: FC<CurrentBackingProps> = ({ existentAllocation }) => {
  return (
    <div className="border-t border-v3-bg-accent-40 p-3" data-testid="currentBackingContainer">
      {/* FIXME: variables to moved in the variables file */}
      <Label className="text-xs text-v3-text-60" data-testid="currentBackingLabel">
        Current backing
      </Label>
      <div className="flex gap-2 text-xs">
        <span className="text-[16px]" data-testid="currentBackingValue">
          {formatSymbol(existentAllocation, 'stRIF')}
        </span>{' '}
        <RIFToken />
      </div>
    </div>
  )
}
