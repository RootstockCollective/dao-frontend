import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { formatSymbol } from '@/app/collective-rewards/rewards'
import {
  BuilderInactiveState,
  builderInactiveStateMessage,
  getBuilderInactiveState,
} from '@/app/collective-rewards/utils'
import { Circle } from '@/components/Circle'
import { CommonComponentProps } from '@/components/commonProps'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import { Span } from '@/components/Typography'
import { STRIF } from '@/lib/constants'
import { cn, truncate } from '@/lib/utils'
import { ReactElement, useContext } from 'react'
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
  adjacentItem?: AllocationItem
  isResizing?: boolean
}

type BuildersInactiveState = BuilderInactiveState | `both_${BuilderInactiveState}`

const BUILDER_INACTIVE_MESSAGES: Record<BuildersInactiveState, string> = {
  ...builderInactiveStateMessage,
  both_deactivated: 'Both Builders were voted out by the community.',
  both_kycRevoked: 'Both Builders were removed by the Foundation.',
  both_paused: 'Both Builders’ KYC has been paused by the Foundation.',
  both_selfPaused: 'Both Builders have paused their participation.',
}

const createInactiveBuilderMessage = (inactiveState: BuilderInactiveState, isPlural?: boolean) =>
  BUILDER_INACTIVE_MESSAGES[`${isPlural ? 'both_' : ''}${inactiveState}` as BuildersInactiveState]

export const AllocationBarTooltip = ({
  targetItem,
  adjacentItem,
  isResizing = false,
  className,
}: AllocationBarTooltipProps): ReactElement => {
  const {
    state: { getBuilder },
  } = useContext(AllocationsContext)
  const targetBuilder = getBuilder(targetItem.key)
  const adjacentBuilder = adjacentItem ? getBuilder(adjacentItem.key) : null

  const targetBuilderInactiveState = targetBuilder ? getBuilderInactiveState(targetBuilder) : null
  const adjacentBuilderInactiveState = adjacentBuilder ? getBuilderInactiveState(adjacentBuilder) : null

  const areStatesSame = targetBuilderInactiveState === adjacentBuilderInactiveState

  const targetBlockedMessage = targetBuilderInactiveState
    ? createInactiveBuilderMessage(targetBuilderInactiveState, areStatesSame)
    : null
  const adjacentBlockedMessage =
    adjacentBuilderInactiveState && !areStatesSame
      ? createInactiveBuilderMessage(adjacentBuilderInactiveState)
      : null

  const hasChangedValue = targetItem.initialValue !== targetItem.value

  // TODO: this could be done in a cleaner way
  if (targetBuilderInactiveState || (isResizing && adjacentBuilderInactiveState)) {
    return (
      <BarTooltipContent className={cn(className, 'flex-col w-80 items-start')}>
        {/* Combine messages if both builders are inactive in the same way */}
        {areStatesSame && targetBlockedMessage && (
          <Span variant="body-s" className="text-left">
            {targetBlockedMessage}
          </Span>
        )}

        {/* Target builder info */}
        <div className="flex justify-between self-stretch">
          <BarTooltipLabelItem>
            <Circle color={targetItem.displayColor} className="w-2 h-2" /> {truncate(targetItem.label, 25)}
          </BarTooltipLabelItem>
          <BarTooltipValueItem>{formatSymbol(targetItem.initialValue ?? 0n, STRIF)}</BarTooltipValueItem>

          {hasChangedValue && (
            <BarTooltipValueItem>
              <HourglassIcon className="size-4" color="var(--background-40)" />
              {formatSymbol(targetItem.value, STRIF)}
            </BarTooltipValueItem>
          )}
        </div>

        {/* Inactive message for the target builder if states are different */}
        {!areStatesSame && targetBlockedMessage && (
          <Span variant="body-s" className="text-left pl-2">
            {targetBlockedMessage}
          </Span>
        )}

        {/* Adjacent builder info */}
        {adjacentItem && (
          <div className="flex justify-between self-stretch">
            <BarTooltipLabelItem>
              <Circle color={adjacentItem.displayColor} className="w-2 h-2" />{' '}
              {truncate(adjacentItem.label, 25)}
            </BarTooltipLabelItem>
            <BarTooltipValueItem>{formatSymbol(adjacentItem.initialValue ?? 0n, STRIF)}</BarTooltipValueItem>

            {hasChangedValue && (
              <BarTooltipValueItem>
                <HourglassIcon className="size-4" color="var(--background-40)" />
                {formatSymbol(adjacentItem.value, STRIF)}
              </BarTooltipValueItem>
            )}
          </div>
        )}

        {/* Inactive message for the adjacent builder if states are different */}
        {adjacentItem && !areStatesSame && adjacentBlockedMessage && (
          <Span variant="body-s" className="text-left pl-2">
            {adjacentBlockedMessage}
          </Span>
        )}
      </BarTooltipContent>
    )
  }

  return (
    <BarTooltipContent className={className}>
      <BarTooltipLabels>
        <BarTooltipLabelItem>
          <Circle color={targetItem.displayColor} className="w-2 h-2" /> {truncate(targetItem.label, 25)}
        </BarTooltipLabelItem>
        {isResizing && adjacentItem && (
          <BarTooltipLabelItem>
            <Circle color={adjacentItem.displayColor} className="w-2 h-2" />{' '}
            {truncate(adjacentItem.label, 25)}
          </BarTooltipLabelItem>
        )}
      </BarTooltipLabels>

      {targetItem.initialValue !== targetItem.value && (
        <BarTooltipValues label="Pending">
          <BarTooltipValueItem>
            <HourglassIcon className="size-4" color="var(--background-40)" />
            {formatSymbol(targetItem.value, STRIF)}
          </BarTooltipValueItem>
          {isResizing && adjacentItem && (
            <BarTooltipValueItem>
              <HourglassIcon className="size-4" color="var(--background-40)" />
              {formatSymbol(adjacentItem.value, STRIF)}
            </BarTooltipValueItem>
          )}
        </BarTooltipValues>
      )}

      <BarTooltipValues label="Current">
        <BarTooltipValueItem>{formatSymbol(targetItem.initialValue ?? 0n, STRIF)}</BarTooltipValueItem>
        {isResizing && adjacentItem && (
          <BarTooltipValueItem>{formatSymbol(adjacentItem.initialValue ?? 0n, STRIF)}</BarTooltipValueItem>
        )}
      </BarTooltipValues>
    </BarTooltipContent>
  )
}
