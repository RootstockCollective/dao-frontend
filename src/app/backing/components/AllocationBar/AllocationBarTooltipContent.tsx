import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import { Typography } from '@/components/TypographyNew'
import { STRIF } from '@/lib/constants'
import { shortAddress } from '@/lib/utils'
import { Address } from 'viem'

interface AllocationBarTooltipProps {
  builderAddress: string
  currentBacking: bigint
  pendingBacking: bigint
  percentage?: string
}

export const AllocationBarTooltipContent = ({
  builderAddress,
  currentBacking,
  pendingBacking,
  percentage = '',
}: AllocationBarTooltipProps) => {
  const isUnallocated = builderAddress === 'unallocated'

  return (
    <div className="w-[230px] p-3">
      <div className="inline-flex items-center gap-1">
        <Typography variant="tag-s" className="text-foreground">
          {isUnallocated ? 'Unallocated' : shortAddress(builderAddress as Address)}
        </Typography>
        {percentage && (
          <Typography variant="tag-s" className="font-light">
            ({percentage})
          </Typography>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-2">
        {pendingBacking > 0n && builderAddress !== 'unallocated' && (
          <div className="flex justify-between items-center text-secondary gap-5">
            <Typography>Pending</Typography>
            <span className="inline-flex items-center gap-1">
              <HourglassIcon className="size-5" color="var(--background-40)" />
              <Typography>{formatSymbol(pendingBacking, STRIF)}</Typography>
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-secondary gap-5">
          <Typography>{isUnallocated ? 'Unallocated backing' : 'Current backing'}</Typography>
          <Typography>{formatSymbol(currentBacking, STRIF)}</Typography>
        </div>
      </div>
    </div>
  )
}
