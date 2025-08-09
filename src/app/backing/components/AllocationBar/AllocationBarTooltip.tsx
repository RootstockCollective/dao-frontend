import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import { Typography } from '@/components/TypographyNew/Typography'
import { shortAddress } from '@/lib/utils'

interface AllocationBarTooltipProps {
  builderAddress: string
  currentBacking: number
  pendingBacking: number
  isTemporary?: boolean
}

export const AllocationBarTooltip = ({
  builderAddress,
  currentBacking,
  pendingBacking,
  isTemporary,
}: AllocationBarTooltipProps) => {
  return (
    <div className="w-[230px] p-3">
      <Typography variant="tag-s" className="text-foreground">
        {builderAddress === 'unallocated' ? 'Unallocated' : shortAddress(builderAddress as `0x${string}`)}
      </Typography>
      <div className="flex flex-col gap-1 mt-2">
        {isTemporary && (
          <div className="flex justify-between items-center text-secondary gap-5">
            <Typography>Pending</Typography>
            <span className="inline-flex items-center gap-1">
              <HourglassIcon className="size-5" color="var(--background-40)" />
              <Typography>{pendingBacking.toLocaleString()}</Typography>
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-secondary gap-5">
          <Typography>Current backing</Typography>
          <Typography>{currentBacking.toLocaleString()}</Typography>
        </div>
      </div>
    </div>
  )
}
