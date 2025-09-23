import { FC, HtmlHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { DisclaimerFlow } from '@/shared/walletConnection'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { useLongPressTouch } from '@/shared/hooks/useLongPressTouch'
import { BuilderNameCell } from './Cell/BuilderNameCell'
import { ActionCell } from './Cell/ActionCell'
import { SelectorCell } from './Cell/SelectorCell'
import { BuilderTable } from './BuilderTable.config'
import { useBuilderRowLogic } from './hooks/useBuilderRowLogic'
import { MOBILE_ROW_STYLES } from './utils/builderRowUtils'
import { ExpandChevron } from './ExpandChevron'
import { BuilderRowConditionalTooltip } from './BuilderRowConditionalTooltip'
import {
  MobileBackerRewardsSection,
  MobileRewardsSection,
  MobileBackingSection,
  MobileTwoColumnWrapper,
  MobileColumnItem,
} from './MobileSections'

interface MobileBuilderRowProps extends HtmlHTMLAttributes<HTMLTableRowElement> {
  row: BuilderTable['Row']
  userBacking: bigint
}

export const MobileBuilderRow: FC<MobileBuilderRowProps> = ({ row, userBacking, ...props }) => {
  const logic = useBuilderRowLogic({ row, userBacking })
  const {
    data,
    isExpanded,
    isRowSelected,
    isInProgress,
    canBack,
    hasSelections,
    isConnected,
    handleToggleSelection,
    handleToggleExpand,
    intermediateStep,
    handleConnectWallet,
    handleCloseIntermediateStep,
    onConnectWalletButtonClick,
  } = logic

  // Long press functionality for selection
  const longPressHandlers = useLongPressTouch({
    onLongPress: () => {
      if (isConnected && canBack) {
        handleToggleSelection()
      }
    },
    threshold: 500, // 500ms for long press
    moveTolerance: 10, // 10px movement tolerance
  })

  const {
    builder,
    backing,
    backer_rewards,
    rewards_past_cycle,
    rewards_upcoming,
    backingShare: { backingPercentage },
    actions,
  } = data

  return (
    <>
      <BuilderRowConditionalTooltip
        className="p-0 ml-4"
        isConnected={isConnected}
        canBack={canBack}
        hasSelections={hasSelections}
        onConnectWalletButtonClick={onConnectWalletButtonClick}
      >
        <tr
          {...props}
          className={cn(
            MOBILE_ROW_STYLES.base,
            isRowSelected ? MOBILE_ROW_STYLES.selected : MOBILE_ROW_STYLES.unselected,
          )}
          onTouchStart={longPressHandlers.onTouchStart}
          onTouchMove={longPressHandlers.onTouchMove}
          onTouchEnd={longPressHandlers.onTouchEnd}
          onTouchCancel={longPressHandlers.onTouchCancel}
        >
          <td className="w-full">
            {/* Row 1: BuilderCell + expand/collapse trigger */}
            <div className="flex items-start w-full">
              <div className="flex items-center gap-4 flex-1">
                <SelectorCell
                  isHovered={isRowSelected}
                  isSelected={isRowSelected}
                  className="pt-3 pb-3 rounded-full"
                >
                  <Jdenticon className="rounded-full bg-white w-10" value={builder.builder.address} />
                </SelectorCell>
                <BuilderNameCell {...builder} isHighlighted={isRowSelected} />
              </div>
              {!isInProgress && (
                <ExpandChevron
                  isExpanded={isExpanded}
                  onToggle={handleToggleExpand}
                  isRowSelected={isRowSelected}
                />
              )}
            </div>

            {/* Row 2: BackerRewardsCell + RewardsUpcomingCell (collapsed state only) */}
            {!isInProgress && !isExpanded && (
              <MobileTwoColumnWrapper className="mt-2">
                <MobileColumnItem>
                  <MobileBackerRewardsSection
                    backer_rewards={backer_rewards}
                    showChangeIndicator={false}
                    isRowSelected={isRowSelected}
                  />
                </MobileColumnItem>
                <MobileColumnItem>
                  <MobileRewardsSection
                    rewards_past_cycle={rewards_past_cycle}
                    rewards_upcoming={rewards_upcoming}
                    showBothColumns={false}
                    isRowSelected={isRowSelected}
                  />
                </MobileColumnItem>
              </MobileTwoColumnWrapper>
            )}

            {/* Row 3: BuilderBackingCell (only in collapsed state) */}
            {!isInProgress && !isExpanded && (
              <MobileBackingSection
                backing={backing}
                showUsd={false}
                className="mt-4"
                isRowSelected={isRowSelected}
              />
            )}

            {/* Expanded content */}
            {!isInProgress && isExpanded && (
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out mt-2',
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
                )}
              >
                <div className="flex flex-col gap-4">
                  {/* Row 2 (expanded): BackerRewardsCell with change indicator */}
                  <MobileBackerRewardsSection
                    backer_rewards={backer_rewards}
                    showChangeIndicator={true}
                    isRowSelected={isRowSelected}
                  />

                  {/* Row 3 (expanded): RewardsPastCycleCell + RewardsUpcomingCell */}
                  <MobileRewardsSection
                    rewards_past_cycle={rewards_past_cycle}
                    rewards_upcoming={rewards_upcoming}
                    showBothColumns={true}
                    isRowSelected={isRowSelected}
                  />

                  {/* Row 4 (expanded): BuilderBackingCell + BackingShareCell (always show in expanded) */}
                  <MobileBackingSection
                    backing={backing}
                    backingPercentage={backingPercentage}
                    showShare={true}
                    showUsd={true}
                    isRowSelected={isRowSelected}
                  />

                  {/* Row 5 (expanded): ActionCell */}
                  {isConnected && (
                    <div className="w-full min-w-full flex justify-center">
                      <ActionCell
                        {...actions}
                        hidden={false}
                        className={cn(isRowSelected ? 'text-v3-bg-accent-100' : 'text-v3-text-100')}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </td>
        </tr>
      </BuilderRowConditionalTooltip>

      {!!intermediateStep && (
        <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleCloseIntermediateStep} />
      )}
    </>
  )
}
