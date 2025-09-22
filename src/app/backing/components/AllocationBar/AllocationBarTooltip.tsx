import { formatSymbol } from '@/app/collective-rewards/rewards'
import { Circle } from '@/components/Circle'
import { CommonComponentProps } from '@/components/commonProps'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import { STRIF } from '@/lib/constants'
import { truncate } from '@/lib/utils'
import { ReactElement } from 'react'
import {
  BarTooltipContent,
  BarTooltipLabelItem,
  BarTooltipLabels,
  BarTooltipValueItem,
  BarTooltipValues,
} from './BarTooltipContent'
import { AllocationItem } from './types'

export interface AllocationBarTooltipProps extends CommonComponentProps<HTMLDivElement> {
  targetItem: AllocationItem
  adjecentItem?: AllocationItem
  isResizing?: boolean
}

export const AllocationBarTooltip = ({
  targetItem,
  adjecentItem,
  isResizing = false,
  className,
}: AllocationBarTooltipProps): ReactElement => {
  return (
    <BarTooltipContent className={className}>
      <BarTooltipLabels>
        <BarTooltipLabelItem>
          <Circle color={targetItem.displayColor} className="w-2 h-2" /> {truncate(targetItem.label, 25)}
        </BarTooltipLabelItem>
        {isResizing && adjecentItem && (
          <BarTooltipLabelItem>
            <Circle color={adjecentItem.displayColor} className="w-2 h-2" />{' '}
            {truncate(adjecentItem.label, 25)}
          </BarTooltipLabelItem>
        )}
      </BarTooltipLabels>

      {targetItem.initialValue !== targetItem.value && (
        <BarTooltipValues label="Pending">
          <BarTooltipValueItem>
            <HourglassIcon className="size-4" color="var(--background-40)" />
            {formatSymbol(targetItem.value, STRIF)}
          </BarTooltipValueItem>
          {isResizing && adjecentItem && (
            <BarTooltipValueItem>
              <HourglassIcon className="size-4" color="var(--background-40)" />
              {formatSymbol(adjecentItem.value, STRIF)}
            </BarTooltipValueItem>
          )}
        </BarTooltipValues>
      )}

      <BarTooltipValues label="Current">
        <BarTooltipValueItem>{formatSymbol(targetItem.initialValue ?? 0n, STRIF)}</BarTooltipValueItem>
        {isResizing && adjecentItem && (
          <BarTooltipValueItem>{formatSymbol(adjecentItem.initialValue ?? 0n, STRIF)}</BarTooltipValueItem>
        )}
      </BarTooltipValues>
    </BarTooltipContent>
  )
}
