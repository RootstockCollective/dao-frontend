import React from 'react'

import { formatSymbol } from '@/app/collective-rewards/rewards'
import { Circle } from '@/components/Circle'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import { STRIF } from '@/lib/constants'
import { truncate } from '@/lib/utils'
import {
  BarTooltipConent,
  BarTooltipLabelItem,
  BarTooltipLabels,
  BarTooltipValueItem,
  BarTooltipValues,
} from './BarTooltipConent'
import { AllocationItem } from './types'

interface AllocationBarTooltipProps {
  item: AllocationItem
  index: number
  items: AllocationItem[]
  values: bigint[]
  dragIndex: number | null
}

export const AllocationBarTooltip: React.FC<AllocationBarTooltipProps> = ({
  item,
  index,
  items,
  values,
  dragIndex,
}) => {
  const isResizing = dragIndex === index || dragIndex === index - 1 || dragIndex === index + 1
  const adjecentSegmentResizeIndex = index + (dragIndex === index ? 1 : -1)

  return (
    <BarTooltipConent className="">
      <BarTooltipLabels>
        <BarTooltipLabelItem>
          <Circle color={item.displayColor} className="w-2 h-2" /> {truncate(item.label, 25)}
        </BarTooltipLabelItem>
        {isResizing && (
          <BarTooltipLabelItem>
            <Circle color={items[adjecentSegmentResizeIndex].displayColor} className="w-2 h-2" />{' '}
            {truncate(items[adjecentSegmentResizeIndex].label, 25)}
          </BarTooltipLabelItem>
        )}
      </BarTooltipLabels>

      {item.initialValue !== item.value && (
        <BarTooltipValues label="Pending">
          <BarTooltipValueItem>
            <HourglassIcon className="size-4" color="var(--background-40)" />
            {formatSymbol(item.value, STRIF)}
          </BarTooltipValueItem>
          {isResizing && (
            <BarTooltipValueItem>
              <HourglassIcon className="size-4" color="var(--background-40)" />
              {formatSymbol(values[adjecentSegmentResizeIndex], STRIF)}
            </BarTooltipValueItem>
          )}
        </BarTooltipValues>
      )}

      <BarTooltipValues label="Current">
        <BarTooltipValueItem>{formatSymbol(item.initialValue ?? 0n, STRIF)}</BarTooltipValueItem>
        {isResizing && (
          <BarTooltipValueItem>
            {formatSymbol(items[adjecentSegmentResizeIndex].initialValue ?? 0n, STRIF)}
          </BarTooltipValueItem>
        )}
      </BarTooltipValues>
    </BarTooltipConent>
  )
}

export default AllocationBarTooltip
