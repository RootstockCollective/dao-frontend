'use client'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { BuildersRewards, formatSymbol } from '@/app/collective-rewards/rewards' // FIXME: change path so as to not import from a cousin folder
import { Builder } from '@/app/collective-rewards/types'
import { getFiatAmount } from '@/app/collective-rewards/utils' // FIXME: change path so as to not import from a cousin folder
import { Jdenticon } from '@/components/Header/Jdenticon'
import { TokenImage } from '@/components/TokenImage'
import { Typography } from '@/components/TypographyNew/Typography'
import { RIF } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { Row, RowData, useTableActionsContext, useTableContext } from '@/shared/context'
import { FC, HtmlHTMLAttributes, ReactElement, useContext, useState } from 'react'
import { Address } from 'viem'
import { COLUMN_WIDTHS, ColumnId } from './BuilderTable.config'
import { Action, ActionCell, ActionCellProps, getActionType } from './Cell/ActionCell'
import { BackersPercentageCell, BackersPercentageCellProps } from './Cell/BackersPercentageCell'
import { BackingShareCell, BackingShareCellProps } from './Cell/BackingShareCell'
import { BuilderNameCell, BuilderNameCellProps } from './Cell/BuilderNameCell'
import { RewardsCell, RewardsCellProps } from './Cell/RewardsCell'
import { SelectorCell } from './Cell/SelectorCell'

export type ColumnIdToCellPropsMap = {
  builder: BuilderNameCellProps
  backing: BackingCellProps
  backer_rewards: BackersPercentageCellProps
  rewards_past_cycle: RewardsCellProps
  rewards_upcoming: RewardsCellProps
  backing_share: BackingShareCellProps
  actions: ActionCellProps
}

export type BuilderRowData = RowData<ColumnId, ColumnIdToCellPropsMap[ColumnId]>

export const convertDataToRowData = (
  data: BuildersRewards[],
  userAllocations: (bigint | undefined)[],
  rifPrice: number,
  handleAction: (action: Action, builder: Builder) => void,
): Row<ColumnId>[] => {
  // FIXME: fix the Row type to take a generic for custom RowData type
  if (!data.length) return []
  // debugger
  return data.map<{ id: Address; data: ColumnIdToCellPropsMap }>((builder, index) => {
    const allocation = userAllocations[index] ?? 0n
    const actionType = getActionType(builder, allocation > 0n)

    return {
      id: builder.address,
      data: {
        builder: {
          builder,
        },
        backing: {
          rifValue: allocation,
          usdValue: getFiatAmount({
            value: allocation,
            price: rifPrice,
            symbol: RIF,
            currency: 'USD',
          }).toNumber(),
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
        backing_share: {
          backingSharePct: builder.totalAllocationPercentage,
        },
        actions: {
          actionType,
          onClick: () => {
            handleAction(actionType, builder)
            if (actionType === 'removeBacking') {
              // TODO: remove backing
              console.log('remove backing')
            } else if (actionType === 'backBuilder') {
              // TODO: back builder
              console.log('back builder')
            } else if (actionType === 'adjustBacking') {
              // TODO: adjust backing
              console.log('adjust backing')
            }
          },
        },
      },
    }
  })
}

/// ---------- Builder Cell ----------

const BuilderCell = (props: BuilderNameCellProps): ReactElement => {
  const { selectedRows } = useTableContext<ColumnId>()
  const isSelected = selectedRows[props.builder.address]

  return (
    <TableCell key="builder" columnId="builder" className="justify-start gap-4">
      <SelectorCell isHovered={props.isHighlighted} isSelected={isSelected} className="pt-3 pb-3">
        <Jdenticon className="rounded-full bg-white w-10" value={props.builder.address} />
      </SelectorCell>

      <BuilderNameCell {...props} />
    </TableCell>
  )
}

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
  rifValue: bigint
  usdValue: number
}

const BackingCell = ({ rifValue, usdValue }: BackingCellProps): ReactElement => {
  // FIXME: create a proper implementation of this cell
  return (
    <TableCell columnId="backing" className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center justify-between w-full">
        <Typography className="text-lg">{formatSymbol(rifValue, RIF)}</Typography>
        <TokenImage symbol={RIF} size={16} className="ml-[1.3px] mr-[3.7px]" />
      </div>
      <div className="flex flex-row gap-2 items-center justify-center w-full">
        <Typography className="text-sm">{formatCurrency(usdValue, { currency: 'USD' })}</Typography>
        <Typography className="text-sm">USD</Typography>
      </div>
    </TableCell>
  )
}

const BackerRewardsCell = (props: BackersPercentageCellProps): ReactElement => {
  return (
    <TableCell columnId="backer_rewards" className="gap-2 flex">
      <BackersPercentageCell {...props} />
    </TableCell>
  )
}

const RewardsPastCycleCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="rewards_past_cycle">
      <RewardsCell {...props} />
    </TableCell>
  )
}

const RewardsUpcomingCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="rewards_upcoming">
      <RewardsCell {...props} />
    </TableCell>
  )
}

const BuilderBackingShareCell = (props: BackingShareCellProps): ReactElement => {
  return (
    <TableCell columnId="backing_share">
      <BackingShareCell {...props} />
    </TableCell>
  )
}

const BuilderActionsCell = ({ className, ...props }: ActionCellProps): ReactElement => {
  return (
    <TableCell columnId="actions" className={cn('border-solid align-center', className)}>
      <ActionCell {...props} />
    </TableCell>
  )
}

interface BuilderDataRowProps {
  row: Row<ColumnId>
}

const selectedRowStyle = 'bg-v3-text-80 text-v3-bg-accent-100'
const unselectedRowStyle = 'bg-v3-bg-accent-80 text-v3-primary-100'

export const BuilderDataRow: FC<BuilderDataRowProps> = ({ row }) => {
  const {
    id: rowId,
    data: {
      builder,
      backing,
      backer_rewards,
      rewards_past_cycle,
      rewards_upcoming,
      backing_share: { backingSharePct: allocationPct },
      actions,
    },
  } = row as Row<ColumnId> & { data: ColumnIdToCellPropsMap }
  const { selectedRows } = useTableContext<ColumnId>()
  const [isHovered, setIsHovered] = useState(false)
  const dispatch = useTableActionsContext<ColumnId>()
  const {
    actions: { toggleSelectedBuilder },
  } = useContext(AllocationsContext)

  const handleToggleSelection = () => {
    dispatch({
      type: 'TOGGLE_ROW_SELECTION',
      payload: rowId,
    })
    toggleSelectedBuilder(rowId as Address) // TODO: do we need both?
  }

  return (
    <tr
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
      <RewardsPastCycleCell {...rewards_past_cycle} />
      <RewardsUpcomingCell {...rewards_upcoming} />
      <BackingCell {...backing} />
      {!isHovered && <BuilderBackingShareCell backingSharePct={allocationPct} />}
      {isHovered && <BuilderActionsCell {...actions} />}
    </tr>
  )
}
