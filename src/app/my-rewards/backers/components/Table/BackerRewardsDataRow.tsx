'use client'

import { selectedRowStyle, unselectedRowStyle } from '@/app/builders/components/Table'
import { getActionType } from '@/app/builders/components/Table/Cell/ActionCell'
import { RewardsCell, RewardsCellProps } from '@/app/builders/components/Table/Cell/RewardsCell'
import { BackerRewards } from '@/app/collective-rewards/rewards/backers/hooks'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils'
import { getCombinedFiatAmount } from '@/app/collective-rewards/utils'
import { ConditionalTooltip } from '@/app/components/Tooltip/ConditionalTooltip'
import { GetPricesResult } from '@/app/user/types'
import { RIF, STRIF } from '@/lib/tokens'
import { cn, formatCurrency } from '@/lib/utils'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { redirect, RedirectType } from 'next/navigation'
import { FC, HtmlHTMLAttributes, ReactElement, ReactNode, useState } from 'react'
import { useAccount } from 'wagmi'
import {
  BackerRewardsCellDataMap,
  BackerRewardsTable,
  COLUMN_TRANSFORMS,
  ColumnId,
} from './BackerRewardsTable.config'
import {
  ActionsCell,
  BackerRewardsCell,
  BuilderBackingCell,
  BuilderCell,
} from '@/app/builders/components/Table/DesktopCells'
import { SelectBuildersTooltipContent } from '@/app/builders/components/Table/TooltipContents'

// Local TableCellBase for backer rewards table
const BackerTableCellBase = ({
  children,
  className,
  onClick,
  columnId,
  forceShow,
}: HtmlHTMLAttributes<HTMLTableCellElement> & {
  columnId: ColumnId
  forceShow?: boolean
}): ReactNode => {
  const { columns } = useTableContext<ColumnId, BackerRewardsCellDataMap>()
  if (forceShow || !columns.find(col => col.id === columnId)?.hidden) {
    return (
      <td
        className={cn('flex self-stretch items-center select-none', COLUMN_TRANSFORMS[columnId], className)}
        onClick={onClick}
      >
        {children}
      </td>
    )
  }
  return null
}

export const convertDataToRowData = (
  data: BackerRewards[],
  prices: GetPricesResult,
): BackerRewardsTable['Row'][] => {
  if (!data.length) return []

  return data.map<BackerRewardsTable['Row']>(builder => {
    const hasAllocations = builder.totalAllocation.rif.amount.value > 0n
    const actionType = getActionType(builder, hasAllocations)

    const rifPrice = prices[RIF]?.price ?? 0

    return {
      id: builder.address,
      data: {
        builder: {
          builder,
        },
        backer_rewards: {
          percentage: builder.rewardPercentage ?? { current: 50n, next: 30n, cooldownEndTime: 100n },
        },
        unclaimed: {
          rbtcValue: builder.claimableRewards.rbtc.amount.value,
          rifValue: builder.claimableRewards.rif.amount.value,
          usdValue: getCombinedFiatAmount([
            builder.claimableRewards.rif.amount,
            builder.claimableRewards.rbtc.amount,
          ]).toNumber(),
        },
        estimated: {
          rbtcValue: builder.estimatedRewards.rbtc.amount.value,
          rifValue: builder.estimatedRewards.rif.amount.value,
          usdValue: getCombinedFiatAmount([
            builder.estimatedRewards.rif.amount,
            builder.estimatedRewards.rbtc.amount,
          ]).toNumber(),
        },
        backing: {
          amount: builder.totalAllocation.rif.amount.value,
          formattedAmount: formatSymbol(builder.totalAllocation.rif.amount.value, STRIF),
          formattedUsdAmount: formatCurrency(
            getFiatAmount(builder.totalAllocation.rif.amount.value, rifPrice),
          ),
        },
        total: {
          rbtcValue: builder.allTimeRewards.rbtc.amount.value,
          rifValue: builder.allTimeRewards.rif.amount.value,
          usdValue: getCombinedFiatAmount([
            builder.allTimeRewards.rif.amount,
            builder.allTimeRewards.rbtc.amount,
          ]).toNumber(),
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

const TableCell = ({
  children,
  className,
  onClick,
  columnId,
  forceShow,
}: HtmlHTMLAttributes<HTMLTableCellElement> & { columnId: ColumnId; forceShow?: boolean }): ReactNode => {
  return (
    <BackerTableCellBase className={className} onClick={onClick} columnId={columnId} forceShow={forceShow}>
      {children}
    </BackerTableCellBase>
  )
}

const UnclaimedCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="unclaimed" className="justify-center">
      <RewardsCell {...props} />
    </TableCell>
  )
}

const EstimatedCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="estimated" className="justify-center">
      <RewardsCell {...props} />
    </TableCell>
  )
}

const TotalCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="total" className="justify-center">
      <RewardsCell {...props} />
    </TableCell>
  )
}

interface BackerRewardsDataRowProps {
  row: BackerRewardsTable['Row']
}

export const BackerRewardsDataRow: FC<BackerRewardsDataRowProps> = ({ row, ...props }) => {
  const {
    id: rowId,
    data: { builder, backing, backer_rewards, unclaimed, estimated, total, actions },
  }: BackerRewardsTable['Row'] = row
  const { selectedRows } = useTableContext<ColumnId, BackerRewardsCellDataMap>()
  const { isConnected } = useAccount()
  const [isHovered, setIsHovered] = useState(false)
  const dispatch = useTableActionsContext<ColumnId, BackerRewardsCellDataMap>()

  const hasSelections = Object.values(selectedRows).some(Boolean)

  const handleToggleSelection = () => {
    if (!isConnected) {
      return
    }

    dispatch({
      type: 'TOGGLE_ROW_SELECTION',
      payload: rowId,
    })
  }

  return (
    <ConditionalTooltip
      side="top"
      align="start"
      className="p-0 ml-16"
      conditionPairs={[
        {
          condition: () => !hasSelections,
          lazyContent: () => <SelectBuildersTooltipContent />,
        },
      ]}
    >
      <tr
        {...props}
        className={cn(
          'flex border-b-v3-bg-accent-60 border-b-1 gap-4 pl-4',
          selectedRows[rowId] || isHovered ? selectedRowStyle : unselectedRowStyle,
        )}
        onClick={handleToggleSelection}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <BuilderCell {...builder} isHighlighted={isHovered} />
        <BackerRewardsCell {...backer_rewards} />
        <UnclaimedCell {...unclaimed} />
        <EstimatedCell {...estimated} />
        <TotalCell {...total} />
        <BuilderBackingCell {...backing} className={isHovered ? 'hidden' : 'visible'} />
        <ActionsCell {...actions} forceShow={isHovered} />
        <td className="w-[24px]"></td>
      </tr>
    </ConditionalTooltip>
  )
}
