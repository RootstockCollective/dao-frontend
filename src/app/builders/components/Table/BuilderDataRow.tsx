'use client'

import { formatMetrics } from '@/app/collective-rewards/rewards/utils'
import { BuilderRewardsSummary } from '@/app/collective-rewards/types'
import {
  getCombinedFiatAmount,
  isBuilderInProgress,
  getBuilderInactiveState,
} from '@/app/collective-rewards/utils'
import { ConditionalTooltip } from '@/app/components'
import { ConnectTooltipContent } from '@/app/components/Tooltip/ConnectTooltip/ConnectTooltipContent'
import { GetPricesResult } from '@/app/user/types'
import { CommonComponentProps } from '@/components/commonProps'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { Paragraph } from '@/components/TypographyNew'
import { RIF, STRIF } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { BaseColumnId, Row, RowData, useTableActionsContext, useTableContext } from '@/shared/context'
import { DisclaimerFlow } from '@/shared/walletConnection'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { redirect, RedirectType } from 'next/navigation'
import { FC, HtmlHTMLAttributes, ReactElement, ReactNode } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { COLUMN_TRANSFORMS, ColumnId, ColumnTransforms } from './BuilderTable.config'
import { ActionCell, ActionCellProps, getActionType } from './Cell/ActionCell'
import { AllocationCell, AllocationCellProps } from './Cell/AllocationCell'
import { BackersPercentageCell, BackersPercentageCellProps } from './Cell/BackersPercentageCell'
import { BackingCell, BackingCellProps } from './Cell/BackingCell'
import { BuilderNameCell, BuilderNameCellProps } from './Cell/BuilderNameCell'
import { RewardsCell, RewardsCellProps } from './Cell/RewardsCell'
import { SelectorCell } from './Cell/SelectorCell'

type ColumnIdToCellPropsMap = {
  builder: BuilderNameCellProps
  backing: BackingCellProps
  backer_rewards: BackersPercentageCellProps
  rewards_past_cycle: RewardsCellProps
  rewards_upcoming: RewardsCellProps
  allocations: AllocationCellProps
  actions: ActionCellProps
}

type BuilderRowData = RowData<ColumnId, ColumnIdToCellPropsMap[ColumnId]>

export const convertDataToRowData = (
  data: BuilderRewardsSummary[],
  prices: GetPricesResult,
): Row<ColumnId>[] => {
  // FIXME: fix the Row type to take a generic for custom RowData type

  if (!data.length) return []

  return data.map<{ id: Address; data: ColumnIdToCellPropsMap }>(builder => {
    const allocation = builder.totalAllocation ?? 0n
    const actionType = getActionType(builder, allocation > 0n)

    const rifPrice = prices[RIF]?.price ?? 0
    const { amount: formattedAmount, fiatAmount: formattedUsdAmount } = formatMetrics(
      allocation,
      rifPrice,
      STRIF,
    )

    return {
      id: builder.address,
      data: {
        builder: {
          builder,
        },
        backer_rewards: {
          percentage: builder.backerRewardPct,
        },
        rewards_past_cycle: {
          rbtcValue: builder.lastCycleRewards?.rbtc.amount.value ?? 0n,
          rifValue: builder.lastCycleRewards?.rif.amount.value ?? 0n,
          usdValue: builder.lastCycleRewards
            ? getCombinedFiatAmount([
                builder.lastCycleRewards.rif.amount,
                builder.lastCycleRewards.rbtc.amount,
              ]).toNumber()
            : 0,
        },
        rewards_upcoming: {
          rbtcValue: builder.backerEstimatedRewards?.rbtc.amount.value ?? 0n,
          rifValue: builder.backerEstimatedRewards?.rif.amount.value ?? 0n,
          usdValue: builder.backerEstimatedRewards
            ? getCombinedFiatAmount([
                builder.backerEstimatedRewards.rif.amount,
                builder.backerEstimatedRewards.rbtc.amount,
              ]).toNumber()
            : 0,
        },
        backing: {
          amount: allocation,
          formattedAmount: formattedAmount,
          formattedUsdAmount: formattedUsdAmount,
        },
        allocations: {
          allocationPct: builder.totalAllocationPercentage
            ? Number(builder.totalAllocationPercentage)
            : undefined,
        },
        actions: {
          actionType,
          onClick: () => {
            redirect(`/backing?builders=${builder.address}`, RedirectType.push)
          },
        },
      },
    }
  })
}

export const BuilderCell = (props: BuilderNameCellProps & { canHover?: boolean }): ReactElement => {
  const { selectedRows } = useTableContext<ColumnId>()
  const isSelected = selectedRows[props.builder.address]

  return (
    <TableCell key="builder" columnId="builder" className="justify-start gap-4">
      <SelectorCell
        isSelected={isSelected}
        canHover={props.canHover}
        className="pt-3 pb-3 rounded-full"
      >
        <Jdenticon className="rounded-full bg-white w-10" value={props.builder.address} />
      </SelectorCell>

      <BuilderNameCell {...props} />
    </TableCell>
  )
}

// TODO: @refactor move to app/components/Table/Cell/TableCell.tsx
export const TableCellBase = <CID extends BaseColumnId = BaseColumnId>({
  children,
  className,
  onClick,
  columnId,
  forceShow,
  columnTransforms,
}: HtmlHTMLAttributes<HTMLTableCellElement> & {
  columnId: CID
  forceShow?: boolean
  columnTransforms: ColumnTransforms<CID>
}): ReactNode => {
  const { columns } = useTableContext<CID>()
  if (forceShow || !columns.find(col => col.id === columnId)?.hidden) {
    return (
      <td
        className={cn('flex self-stretch items-center select-none', columnTransforms[columnId], className)}
        onClick={onClick}
      >
        {children}
      </td>
    )
  }

  return null
}

const TableCell = ({
  children,
  className,
  onClick,
  columnId,
  forceShow,
}: HtmlHTMLAttributes<HTMLTableCellElement> & { columnId: ColumnId; forceShow?: boolean }): ReactNode => {
  return (
    <TableCellBase<ColumnId>
      className={className}
      onClick={onClick}
      columnId={columnId}
      forceShow={forceShow}
      columnTransforms={COLUMN_TRANSFORMS}
    >
      {children}
    </TableCellBase>
  )
}

export const BackerRewardsCell = (props: BackersPercentageCellProps): ReactElement => {
  return (
    <TableCell columnId="backer_rewards" className="gap-2 flex justify-center">
      <BackersPercentageCell {...props} />
    </TableCell>
  )
}

const RewardsPastCycleCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="rewards_past_cycle" className="justify-center">
      <RewardsCell {...props} />
    </TableCell>
  )
}

const RewardsUpcomingCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="rewards_upcoming" className="justify-center">
      <RewardsCell {...props} />
    </TableCell>
  )
}

export const BuilderBackingCell = (props: BackingCellProps): ReactElement => {
  return (
    <TableCell columnId="backing" className="flex flex-col gap-2 align-middle justify-center">
      <BackingCell {...props} />
    </TableCell>
  )
}

const BuilderAllocationsCell = (props: AllocationCellProps & { className?: string }): ReactElement => {
  return (
    <TableCell columnId="allocations" className={cn("justify-center", props.className)}>
      <AllocationCell {...props} className="w-[60%] justify-center" />
    </TableCell>
  )
}

export const ActionsCell = ({
  className,
  forceShow,
  ...props
}: ActionCellProps & { forceShow?: boolean; className?: string }): ReactElement => {
  const { isConnected } = useAccount()

  return (
    <TableCell
      columnId="actions"
      className={cn('justify-center', className)}
      forceShow={forceShow}
    >
      {isConnected && <ActionCell {...props} />}
    </TableCell>
  )
}

interface BuilderDataRowProps extends CommonComponentProps<HTMLTableRowElement> {
  row: Row<ColumnId>
}

export const selectedRowStyle = 'bg-v3-text-80 text-v3-bg-accent-100'
export const unselectedRowStyle = 'bg-v3-bg-accent-80 text-v3-primary-100'
export const hoverableRowStyle = 'hover:bg-v3-text-80 hover:text-v3-bg-accent-100 transition-colors duration-150'

export const BuilderDataRow: FC<BuilderDataRowProps> = ({ row, ...props }) => {
  const {
    id: rowId,
    data: {
      builder,
      backing,
      backer_rewards,
      rewards_past_cycle,
      rewards_upcoming,
      allocations: { allocationPct },
      actions,
    },
  } = row as Row<ColumnId> & { data: ColumnIdToCellPropsMap }
  const { selectedRows } = useTableContext<ColumnId>()
  const { isConnected } = useAccount()
  const { intermediateStep, handleConnectWallet, handleCloseIntermediateStep, onConnectWalletButtonClick } =
    useAppKitFlow()

  const dispatch = useTableActionsContext<ColumnId>()

  const hasSelections = Object.values(selectedRows).some(Boolean)

  const isInProgress = isBuilderInProgress(builder.builder)
  const hasInactiveState = getBuilderInactiveState(builder.builder) !== null
  const hasAllocations = backing.amount > 0n

  const canAllocate = !isInProgress && (!hasInactiveState || hasAllocations)

  const handleToggleSelection = () => {
    if (!isConnected) {
      return
    }

    if (!canAllocate) {
      // do not allow selection of builders that are in progress
      return
    }

    dispatch({
      type: 'TOGGLE_ROW_SELECTION',
      payload: rowId,
    })
  }

  return (
    <>
      <ConditionalTooltip
        side="top"
        align="start"
        className="p-0 ml-16"
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
            condition: () => !canAllocate,
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
            'flex border-b-v3-bg-accent-60 border-b-1 gap-4 group',
            selectedRows[rowId] ? selectedRowStyle : unselectedRowStyle,
            canAllocate && hoverableRowStyle,
          )}
          onClick={handleToggleSelection}
        >
          <BuilderCell {...builder} canHover={canAllocate} />
          <BackerRewardsCell {...backer_rewards} />
          <RewardsPastCycleCell {...rewards_past_cycle} />
          <RewardsUpcomingCell {...rewards_upcoming} />
          <BuilderBackingCell {...backing} />
          <BuilderAllocationsCell 
            allocationPct={allocationPct} 
            className={canAllocate ? "group-hover:hidden" : ""} 
          />
          <ActionsCell 
            {...actions} 
            forceShow={true} 
            className={canAllocate ? "hidden group-hover:block" : "hidden"} 
          />
          <td className="w-[24px]"></td>
        </tr>
      </ConditionalTooltip>

      {!!intermediateStep && (
        <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleCloseIntermediateStep} />
      )}
    </>
  )
}

export const SelectBuildersTooltipContent = () => {
  return (
    <div className="flex justify-center">
      <div className="bg-v3-text-80 rounded-sm shadow-sm w-64 flex flex-col items-start p-6 gap-2">
        <Paragraph className="text-v3-bg-accent-100 text-sm w-full font-normal leading-5 rootstock-sans self-stretch">
          Select Builders you want to back
        </Paragraph>
      </div>
    </div>
  )
}

export const NonHoverableBuilderTooltipContent = () => {
  return (
    <div className="flex justify-center">
      <div className="bg-v3-text-80 rounded-sm shadow-sm w-64 flex flex-col items-start p-6 gap-2">
        <Paragraph className="text-v3-bg-accent-100 text-sm w-full font-normal leading-5 rootstock-sans self-stretch">
          This Builder state does not allow allocations
        </Paragraph>
      </div>
    </div>
  )
}
