import { ConditionalTooltip } from '@/app/components'
import { ConnectTooltipContent } from '@/app/components/Tooltip/ConnectTooltip/ConnectTooltipContent'
import { Button } from '@/components/Button'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { CogIcon } from '@/components/Icons/v3design'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Span } from '@/components/Typography/Span'
import { cn } from '@/lib/utils'
import { useLongPressTouch } from '@/shared/hooks/useLongPressTouch'
import { DisclaimerFlow } from '@/shared/walletConnection'
import { FC, HtmlHTMLAttributes, useEffect } from 'react'
import { BuilderTable } from '../BuilderTable.config'
import { ActionCell } from '../Cell/ActionCell'
import { BuilderNameCell } from '../Cell/BuilderNameCell'
import { SelectorCell } from '../Cell/SelectorCell'
import { useBuilderRowLogic } from '../hooks/useBuilderRowLogic'
import { MOBILE_ROW_STYLES } from '../utils/builderRowUtils'
import { ExpandChevron } from './ExpandChevron'
import {
  MobileBackerRewardsSection,
  MobileBackingSection,
  MobileColumnItem,
  MobileRewardsSection,
  MobileTwoColumnWrapper,
} from './MobileSections'
import { NonHoverableBuilderTooltipContent, SelectBuildersTooltipContent } from './TooltipContents'
import { RedirectType } from 'next/dist/client/components/redirect-error'
import { redirect } from 'next/navigation'

interface MobileBuilderRowProps extends HtmlHTMLAttributes<HTMLTableRowElement> {
  row: BuilderTable['Row']
  userBacking: bigint
}

const AdjustBackingDrawerContent = ({
  redirectToAdjustBacking,
  onClose,
  selectedRows,
}: {
  redirectToAdjustBacking: () => void
  onClose: () => void
  selectedRows: number
}) => {
  return (
    <ActionsContainer className="bg-v3-bg-accent-100">
      {/* display: flex;
justify-content: center;
align-items: center;
gap: 1rem;
align-self: stretch; */}
      <div className="flex justify-center gap-4 items-center self-stretch w-full border-t-1 border-t-v3-text-60">
        <Button variant="secondary" onClick={redirectToAdjustBacking}>
          <CogIcon size={20} className="pr-1" /> Adjust Backing
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Deselect{' '}
          {selectedRows > 0 && (
            <Span variant="tag-s" className="text-v3-bg-accent-0 pl-2">
              {selectedRows}
            </Span>
          )}
        </Button>
      </div>
    </ActionsContainer>
  )
}

export const MobileBuilderRow: FC<MobileBuilderRowProps> = ({ row, userBacking, ...props }) => {
  const logic = useBuilderRowLogic({ row, userBacking })

  const {
    data,
    selectedRows,
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
    resetSelectedRows,
  } = logic
  const { openDrawer, closeDrawer } = useLayoutContext()

  const bind = useLongPressTouch({
    onLongPress: () => {
      if (!hasSelections) {
        handleToggleSelection()
        openDrawer(
          <AdjustBackingDrawerContent
            redirectToAdjustBacking={() => {
              redirect(`/backing?builders=${Object.keys(selectedRows).join(',')}`, RedirectType.push)
            }}
            onClose={() => {
              resetSelectedRows()
              closeDrawer()
            }}
            selectedRows={Object.keys(selectedRows).length}
          />,
        )
      }
    },
  })

  const onRowClick = () => {
    if (hasSelections) {
      handleToggleSelection()
    }
  }

  useEffect(() => {
    if (hasSelections) {
      openDrawer(
        <AdjustBackingDrawerContent
          redirectToAdjustBacking={() => {
            redirect(`/backing?builders=${Object.keys(selectedRows).join(',')}`, RedirectType.push)
          }}
          onClose={() => {
            resetSelectedRows()
            closeDrawer()
          }}
          selectedRows={Object.keys(selectedRows).length}
        />,
      )
    }
  }, [selectedRows, hasSelections])

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
      <ConditionalTooltip
        side="top"
        align="start"
        className="p-0 ml-4"
        supportMobileTap={true}
        conditionPairs={[
          {
            condition: () => !isConnected,
            lazyContent: () => (
              <ConnectTooltipContent onClick={onConnectWalletButtonClick}>
                Connect your wallet to select Builders, back and adjust their backing.
              </ConnectTooltipContent>
            ),
          },
          {
            condition: () => !canBack,
            lazyContent: () => <NonHoverableBuilderTooltipContent />,
          },
          {
            condition: () => !hasSelections,
            lazyContent: () => <SelectBuildersTooltipContent />,
          },
        ]}
      >
        <tr
          {...props}
          className={cn(
            MOBILE_ROW_STYLES.base,
            isRowSelected ? MOBILE_ROW_STYLES.selected : MOBILE_ROW_STYLES.unselected,
            'px-4 md:px-0',
          )}
          {...bind}
          onClick={onRowClick}
        >
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
            {!isInProgress && <ExpandChevron isExpanded={isExpanded} onToggle={handleToggleExpand} />}
          </div>

          {/* Row 2: BackerRewardsCell + RewardsUpcomingCell (collapsed state only) */}
          {!isInProgress && !isExpanded && (
            <MobileTwoColumnWrapper className="mt-2">
              <MobileColumnItem>
                <MobileBackerRewardsSection backer_rewards={backer_rewards} showChangeIndicator={false} />
              </MobileColumnItem>
              <MobileColumnItem>
                <MobileRewardsSection
                  rewards_past_cycle={rewards_past_cycle}
                  rewards_upcoming={rewards_upcoming}
                  showBothColumns={false}
                />
              </MobileColumnItem>
            </MobileTwoColumnWrapper>
          )}

          {/* Row 3: BuilderBackingCell (only in collapsed state) */}
          {!isInProgress && !isExpanded && (
            <MobileBackingSection backing={backing} showUsd={false} className="mt-4" />
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
                <MobileBackerRewardsSection backer_rewards={backer_rewards} showChangeIndicator={true} />

                {/* Row 3 (expanded): RewardsPastCycleCell + RewardsUpcomingCell */}
                <MobileRewardsSection
                  rewards_past_cycle={rewards_past_cycle}
                  rewards_upcoming={rewards_upcoming}
                  showBothColumns={true}
                />

                {/* Row 4 (expanded): BuilderBackingCell + BackingShareCell (always show in expanded) */}
                <MobileBackingSection
                  backing={backing}
                  backingPercentage={backingPercentage}
                  showShare={true}
                  showUsd={true}
                />

                {/* Row 5 (expanded): ActionCell */}
                {isConnected && (
                  <div className="w-full min-w-full flex justify-center">
                    <ActionCell {...actions} hidden={false} className="text-v3-text-100" />
                  </div>
                )}
              </div>
            </div>
          )}
        </tr>
      </ConditionalTooltip>

      {!!intermediateStep && (
        <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleCloseIntermediateStep} />
      )}
    </>
  )
}
