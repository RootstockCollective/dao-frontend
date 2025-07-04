'use client'

import { BackerRewardPercentage, BuildersRewards } from '@/app/collective-rewards/rewards' // FIXME: change path so as to not import from a cousin folder
import { getFiatAmount } from '@/app/collective-rewards/utils' // FIXME: change path so as to not import from a cousin folder
import { Jdenticon } from '@/components/Header/Jdenticon'
import { cn } from '@/lib/utils'
import { Column, Row, RowData, useTableActionsContext } from '@/shared/context'
import { FC, HtmlHTMLAttributes, ReactElement } from 'react'
import { COLUMN_WIDTHS, ColumnId } from './BuilderHeaderRow'
import { ActionCell, ActionCellProps } from './Cell/ActionCell'
import { AllocationCell, AllocationCellProps } from './Cell/AllocationCell'
import { BackersPercentageCell } from './Cell/BackersPercentageCell'
import { BuilderNameCell, BuilderNameCellProps } from './Cell/BuilderNameCell'
import { RewardsCell, RewardsCellProps } from './Cell/RewardsCell'
import { SelectorCell } from './Cell/SelectorCell'

export const TableCell: FC<HtmlHTMLAttributes<HTMLTableCellElement> & { columnId: ColumnId }> = ({
  children,
  className,
  onClick,
  columnId,
}) => {
  return (
    <td
      className={cn('flex self-stretch items-center', COLUMN_WIDTHS[columnId], className)}
      onClick={onClick}
    >
      {children}
    </td>
  )
}

type BackingCellProps = {
  id: 'backing'
}

const BackingCell = ({ id }: BackingCellProps): ReactElement => {
  return (
    <TableCell key={id} columnId={id}>
      Backing Data
    </TableCell>
  )
}

export type ColumnIdToCellPropsMap = {
  builder: BuilderCellProps
  backing: BackingCellProps
  backer_rewards: BackerRewardsCellProps
  rewards_past_cycle: RewardsCellProps
  rewards_upcoming: RewardsCellProps
  allocations: AllocationCellProps
  actions: ActionCellProps
}

export type BuilderRowData = RowData<ColumnId, ColumnIdToCellPropsMap[ColumnId]>

export const convertDataToRowData = (data: BuildersRewards[]): Row<ColumnId>[] => {
  if (!data.length) return []
  debugger
  return data.map(builder => {
    return {
      id: builder.address,
      data: {
        builder: {
          builder,
        },
        backing: {
          builderAddress: builder.address,
        },
        backer_rewards: {
          percentage: builder.rewardPercentage ?? { current: 50n, next: 30n, cooldownEndTime: 100n },
        },
        rewards_past_cycle: {
          rbtcValue: builder.lastCycleRewards.rbtc.amount.value,
          rifValue: builder.lastCycleRewards.rif.amount.value,
          usdValue: getFiatAmount(builder.lastCycleRewards.rif.amount).toNumber(),
        },
        rewards_upcoming: {
          rbtcValue: builder.estimatedRewards.rbtc.amount.value,
          rifValue: builder.estimatedRewards.rif.amount.value,
          usdValue: getFiatAmount(builder.estimatedRewards.rif.amount).toNumber(),
        },
        allocations: {
          allocationPct: Number(builder.totalAllocationPercentage),
        },
        actions: {
          actionType: 'nothing' as ActionCellProps['actionType'],
          onClick: () => {},
        },
      },
    }
  })
}

/// ---------- Builder Cell ----------
type BuilderCellProps = BuilderNameCellProps & {
  isSelected: boolean
}

const BuilderCell = ({ isSelected, ...props }: BuilderCellProps): ReactElement => {
  return (
    <TableCell key="builder" columnId="builder" className="justify-start">
      <SelectorCell isSelected={isSelected} className="pt-3 pb-3">
        <Jdenticon className="rounded-full bg-white w-10" value={props.builder.address} />
      </SelectorCell>
      <BuilderNameCell {...props} />
    </TableCell>
  )
}

/// ---------- Backer Rewards Cell ----------
type BackerRewardsCellProps = {
  percentage: BackerRewardPercentage // FIXME: move to shared folder
}

const BackerRewardsCell = ({ percentage }: BackerRewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="backer_rewards" className="gap-2 flex">
      <BackersPercentageCell percentage={percentage} />
    </TableCell>
  )
}

/// ---------- Cells Map ----------
const cells = {
  builder: BuilderCell,
  backing: BackingCell,
  backer_rewards: BackerRewardsCell,
  rewards_past_cycle: (props: RewardsCellProps): ReactElement => (
    <TableCell columnId="rewards_past_cycle">
      <RewardsCell {...props} />
    </TableCell>
  ),
  rewards_upcoming: (props: RewardsCellProps): ReactElement => (
    <TableCell columnId="rewards_upcoming">
      <RewardsCell {...props} />
    </TableCell>
  ),
  allocations: (props: AllocationCellProps): ReactElement => (
    <TableCell columnId="allocations">
      <AllocationCell {...props} />
    </TableCell>
  ),
  actions: ActionCell,
}

const renderDataCells = (columns: Column<ColumnId>[], { data }: Row<ColumnId>): (ReactElement | null)[] => {
  return columns.map(({ id, hidden }) => {
    if (hidden) return null

    const cellConfig = cells[id]
    return cellConfig ? cellConfig(data[id] as any) : null // FIXME: fix this any
  })
}

interface BuilderDataRowProps {
  row: Row<ColumnId>
  columns: Column<ColumnId>[]
}

export const BuilderDataRow: FC<BuilderDataRowProps> = ({ row, columns }) => {
  const dispatch = useTableActionsContext<ColumnId>()

  const handleToggleSelection = () => {
    dispatch({
      type: 'TOGGLE_ROW_SELECTION',
      payload: row.id,
    })
  }

  const cells = renderDataCells(columns, row)

  return (
    <tr className="flex border-b-v3-bg-accent-60 border-b-1" onClick={handleToggleSelection}>
      {cells}
    </tr>
  )
}
