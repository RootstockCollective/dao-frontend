import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import { BaseTypography } from '@/components/Typography/Typography'
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
    <div className="w-[230px] p-4">
      <div className="inline-flex items-center gap-1">
        <BaseTypography variant="tag-s" className="text-foreground">
          {isUnallocated ? 'Unallocated' : shortAddress(builderAddress as Address)}
        </BaseTypography>
        {percentage && (
          <BaseTypography variant="tag-s" className="font-light">
            ({percentage})
          </BaseTypography>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-2">
        {pendingBacking > 0n && builderAddress !== 'unallocated' && (
          <div className="flex justify-between items-center text-secondary gap-5">
            <BaseTypography variant="body-s">Pending</BaseTypography>
            <span className="inline-flex items-center gap-1">
              <HourglassIcon className="size-4" color="var(--background-40)" />
              <BaseTypography variant="tag">{formatSymbol(pendingBacking, STRIF)}</BaseTypography>
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-secondary gap-5">
          <BaseTypography variant="body-s">
            {isUnallocated ? 'Unallocated backing' : 'Current backing'}
          </BaseTypography>
          <BaseTypography variant="tag">{formatSymbol(currentBacking, STRIF)}</BaseTypography>
        </div>
      </div>
    </div>
  )
}
