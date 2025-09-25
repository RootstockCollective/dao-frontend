import { FC, HtmlHTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAccount } from 'wagmi'
import { DisclaimerFlow } from '@/shared/walletConnection'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { useLongPressTouch } from '@/shared/hooks/useLongPressTouch'
import { BuilderNameCell } from './Cell/BuilderNameCell'
import { ActionCell } from './Cell/ActionCell'
import { SelectorCell } from './Cell/SelectorCell'
import { BuilderRowLogic, BuilderTable } from './BuilderTable.config'
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
  logic: BuilderRowLogic
}

export const MobileBuilderRow: FC<MobileBuilderRowProps> = ({ row, userBacking, logic, ...props }) => {
  const { isConnected } = useAccount()
  const { intermediateStep, handleConnectWallet, handleCloseIntermediateStep, onConnectWalletButtonClick } =
    useAppKitFlow()

  const [isExpanded, setIsExpanded] = useState(false)

  const { data, isRowSelected, isInProgress, canBack, handleToggleSelection } = logic

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleAvatarTap = () => {
    if (isConnected && canBack) {
      handleToggleSelection()
    }
  }

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
        canBack={false} // disabled for mobile
        hasSelections={false} // disabled for mobile
        onConnectWalletButtonClick={onConnectWalletButtonClick}
      >
        <tr
          {...props}
          className={cn(
            MOBILE_ROW_STYLES.base,
            isRowSelected ? MOBILE_ROW_STYLES.selected : MOBILE_ROW_STYLES.unselected,
            'select-none', // Prevent text selection
          )}
          style={{
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            userSelect: 'none',
            WebkitTouchCallout: 'none', // Prevents callout on iOS
          }}
          onTouchStart={longPressHandlers.onTouchStart}
          onTouchMove={longPressHandlers.onTouchMove}
          onTouchEnd={longPressHandlers.onTouchEnd}
          onTouchCancel={longPressHandlers.onTouchCancel}
        >
          <td className="w-full">
            {/* Row 1: BuilderCell + expand/collapse trigger */}
            <div className="flex items-start w-full">
              <div className="flex items-center gap-4 flex-1">
                <div
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    handleAvatarTap()
                  }}
                >
                  <SelectorCell
                    isHovered={isRowSelected}
                    isSelected={isRowSelected}
                    className="pt-3 pb-3 rounded-full"
                  >
                    <Jdenticon className="rounded-full bg-white w-10" value={builder.builder.address} />
                  </SelectorCell>
                </div>
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
