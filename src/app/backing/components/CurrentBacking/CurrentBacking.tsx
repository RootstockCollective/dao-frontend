import { formatSymbol } from '@/app/shared/formatter'
import { Label } from '@/components/Typography'

import { RIFToken } from '../RIFToken/RIFToken'

interface CurrentBackingProps {
  existentAllocation: bigint
}

export const CurrentBacking = ({ existentAllocation }: CurrentBackingProps) => {
  return (
    <div className="border-t border-v3-bg-accent-40 p-3" data-testid="currentBackingContainer">
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
