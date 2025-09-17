import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { Circle } from '@/components/Circle'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import { BaseTypography } from '@/components/Typography/Typography'
import { STRIF } from '@/lib/constants'
import { shortAddress } from '@/lib/utils'
import { Address, zeroAddress } from 'viem'

interface AllocationBarTooltipProps {
  builderAddress: Address
  displayColor?: string
  onchainValue: bigint
  pendingValue: bigint
  percentage?: string
}

export const AllocationBarTooltipContent = ({
  builderAddress,
  displayColor,
  onchainValue,
  pendingValue,
  percentage = '',
}: AllocationBarTooltipProps) => {
  const isUnallocated = builderAddress === zeroAddress

  return (
    <div className="w-[230px] p-4">
      <div className="inline-flex items-center gap-1">
        <BaseTypography variant="tag-s">
          {displayColor && <Circle color={displayColor} />}
          {isUnallocated ? 'Available' : shortAddress(builderAddress)}
        </BaseTypography>
        {percentage && (
          <BaseTypography variant="tag-s" className="font-light">
            ({percentage})
          </BaseTypography>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-2">
        {pendingValue > 0n && (
          <div className="flex justify-between items-center text-secondary gap-5">
            <BaseTypography variant="body-s">Pending</BaseTypography>
            <span className="inline-flex items-center gap-1">
              <HourglassIcon className="size-4" color="var(--background-40)" />
              <BaseTypography variant="body" className="text-lg">
                {formatSymbol(pendingValue, STRIF)}
              </BaseTypography>
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-secondary gap-5">
          <BaseTypography variant="body-s">{isUnallocated ? 'Onchain' : 'Current backing'}</BaseTypography>
          <BaseTypography variant="body" className="text-lg">
            {formatSymbol(onchainValue, STRIF)}
          </BaseTypography>
        </div>
      </div>
    </div>
  )
}
