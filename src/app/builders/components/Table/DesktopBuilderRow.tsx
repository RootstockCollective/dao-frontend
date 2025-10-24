import { FC, HtmlHTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAccount } from 'wagmi'
import { DisclaimerFlow } from '@/shared/walletConnection'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { BuilderRowLogic, BuilderTable } from './BuilderTable.config'
import { DESKTOP_ROW_STYLES } from './utils/builderRowUtils'
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
  logic: BuilderRowLogic
  actionCount: number
}

export const DesktopBuilderRow: FC<DesktopBuilderRowProps> = ({
  row,
  userBacking,
  logic,
  actionCount,
  ...props
}) => {
  const { isConnected } = useAccount()
  const { intermediateStep, handleConnectWallet, handleCloseIntermediateStep, onConnectWalletButtonClick } =
    useAppKitFlow()

  const [isHovered, setIsHovered] = useState(false)

  const { data, isRowSelected, canBack, hasSelections, handleToggleSelection } = logic

  const handleMouseEnter = () => {
    if (canBack) setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

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
            className={actionCount < 2 && isHovered && isConnected ? 'hidden' : 'visible'}
          />
          {/* TODO: update behavior so that when 1 row is selected only that row's actions is visible */}
          <ActionsCell {...actions} forceShow={actionCount < 2 && isHovered && isConnected} />
          <td className="w-[24px]"></td>
        </tr>
      </BuilderRowConditionalTooltip>

      {!!intermediateStep && (
        <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleCloseIntermediateStep} />
      )}
    </>
  )
}
