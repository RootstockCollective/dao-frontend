import { FC, HtmlHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { DisclaimerFlow } from '@/shared/walletConnection'
import { BuilderTable } from '../BuilderTable.config'
import { useBuilderRowLogic } from '../hooks/useBuilderRowLogic'
import { DESKTOP_ROW_STYLES } from '../utils/builderRowUtils'
import { BuilderRowConditionalTooltip } from './BuilderRowConditionalTooltip'
import {
  BuilderCell,
  BackerRewardsCell,
  RewardsPastCycleCell,
  RewardsUpcomingCell,
  BuilderBackingCell,
  BuilderBackingShareCell,
  ActionsCell,
} from '@/app/builders/components/Table/DesktopCells'

interface DesktopBuilderRowProps extends HtmlHTMLAttributes<HTMLTableRowElement> {
  row: BuilderTable['Row']
  userBacking: bigint
}

export const DesktopBuilderRow: FC<DesktopBuilderRowProps> = ({ row, userBacking, ...props }) => {
  const logic = useBuilderRowLogic({ row, userBacking })
  const {
    data,
    isHovered,
    isRowSelected,
    canBack,
    hasSelections,
    isConnected,
    handleToggleSelection,
    handleMouseEnter,
    handleMouseLeave,
    intermediateStep,
    handleConnectWallet,
    handleCloseIntermediateStep,
    onConnectWalletButtonClick,
  } = logic

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
        className="p-0 ml-16"
        isConnected={isConnected}
        canBack={canBack}
        hasSelections={hasSelections}
        onConnectWalletButtonClick={onConnectWalletButtonClick}
      >
        <tr
          {...props}
          className={cn(
            DESKTOP_ROW_STYLES.base,
            isRowSelected || isHovered ? DESKTOP_ROW_STYLES.selected : DESKTOP_ROW_STYLES.unselected,
          )}
          onClick={handleToggleSelection}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <BuilderCell {...builder} isHighlighted={isHovered || isRowSelected} />
          <BackerRewardsCell {...backer_rewards} />
          <RewardsPastCycleCell {...rewards_past_cycle} />
          <RewardsUpcomingCell {...rewards_upcoming} />
          <BuilderBackingCell {...backing} />
          <BuilderBackingShareCell
            backingPercentage={backingPercentage}
            className={isHovered && isConnected ? 'hidden' : 'visible'}
          />
          <ActionsCell {...actions} forceShow={isHovered && isConnected} />
          <td className="w-[24px]"></td>
        </tr>
      </BuilderRowConditionalTooltip>

      {!!intermediateStep && (
        <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleCloseIntermediateStep} />
      )}
    </>
  )
}
