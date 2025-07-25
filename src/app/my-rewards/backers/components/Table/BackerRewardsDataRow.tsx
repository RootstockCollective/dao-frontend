'use client'

import {
  ActionsCell,
  BackerRewardsCell,
  BuilderBackingCell,
  BuilderCell,
  SelectBuildersTooltipContent,
  selectedRowStyle,
  TableCellBase,
  unselectedRowStyle,
} from '@/app/builders/components/Table'
import { ActionCellProps, getActionType } from '@/app/builders/components/Table/Cell/ActionCell'
import { BackersPercentageCellProps } from '@/app/builders/components/Table/Cell/BackersPercentageCell'
import { BackingCellProps } from '@/app/builders/components/Table/Cell/BackingCell'
import { BuilderNameCellProps } from '@/app/builders/components/Table/Cell/BuilderNameCell'
import { RewardsCell, RewardsCellProps } from '@/app/builders/components/Table/Cell/RewardsCell'
import { BackerRewards } from '@/app/collective-rewards/rewards/backers/hooks'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { getCombinedFiatAmount } from '@/app/collective-rewards/utils'
import { ConditionalTooltip } from '@/app/components/Tooltip/ConditionalTooltip'
import { GetPricesResult } from '@/app/user/types'
import { RIF } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { Row, RowData, useTableActionsContext, useTableContext } from '@/shared/context'
import { redirect, RedirectType } from 'next/navigation'
import { FC, HtmlHTMLAttributes, ReactElement, ReactNode, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { COLUMN_TRANSFORMS, ColumnId } from './BackerRewardsTable.config'

export type ColumnIdToCellPropsMap = {
  builder: BuilderNameCellProps
  backing: BackingCellProps
  backer_rewards: BackersPercentageCellProps
  unclaimed: RewardsCellProps
  estimated: RewardsCellProps
  total: RewardsCellProps
  actions: ActionCellProps
}

export type BackerRewardsRowData = RowData<ColumnId, ColumnIdToCellPropsMap[ColumnId]>

export const convertDataToRowData = (data: BackerRewards[], prices: GetPricesResult): Row<ColumnId>[] => {
  // FIXME: fix the Row type to take a generic for custom RowData type

  if (!data.length) return []

  return data.map<{ id: Address; data: ColumnIdToCellPropsMap }>(builder => {
    const actionType = getActionType(builder, true)

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
          formattedAmount: formatSymbol(builder.totalAllocation.rif.amount.value, 'stRIF'),
          formattedUsdAmount: formatCurrency(
            getFiatAmount(builder.totalAllocation.rif.amount.value, rifPrice),
            { currency: 'USD' },
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
  row: Row<ColumnId>
}

export const BackerRewardsDataRow: FC<BackerRewardsDataRowProps> = ({ row, ...props }) => {
  const {
    id: rowId,
    data: { builder, backing, backer_rewards, unclaimed, estimated, total, actions },
  } = row as Row<ColumnId> & { data: ColumnIdToCellPropsMap }
  const { selectedRows } = useTableContext<ColumnId>()
  const { isConnected } = useAccount()
  const [isHovered, setIsHovered] = useState(false)
  const dispatch = useTableActionsContext<ColumnId>()

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
          'flex border-b-v3-bg-accent-60 border-b-1 gap-4',
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
        {!isHovered && isConnected && <BuilderBackingCell {...backing} />}
        <ActionsCell {...actions} forceShow={isHovered} />
        <td className="w-[24px]"></td>
      </tr>
    </ConditionalTooltip>
  )
}
