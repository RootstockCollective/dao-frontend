'use client'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { BuildersRewards } from '@/app/collective-rewards/rewards' // FIXME: change path so as to not import from a cousin folder
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { Builder } from '@/app/collective-rewards/types'
import { GetPricesResult } from '@/app/user/types'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { RIF } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { Row, RowData, useTableActionsContext, useTableContext } from '@/shared/context'
import { FC, HtmlHTMLAttributes, ReactElement, useContext, useState } from 'react'
import { Address } from 'viem'
import { COLUMN_TRANFORMS, ColumnId } from './BuilderTable.config'
import { Action, ActionCell, ActionCellProps, getActionType } from './Cell/ActionCell'
import { AllocationCell, AllocationCellProps } from './Cell/AllocationCell'
import { BackersPercentageCell, BackersPercentageCellProps } from './Cell/BackersPercentageCell'
import { BackingCell, BackingCellProps } from './Cell/BackingCell'
import { BuilderNameCell, BuilderNameCellProps } from './Cell/BuilderNameCell'
import { RewardsCell, RewardsCellProps } from './Cell/RewardsCell'
import { SelectorCell } from './Cell/SelectorCell'

export type ColumnIdToCellPropsMap = {
  builder: BuilderNameCellProps
  backing: BackingCellProps
  backer_rewards: BackersPercentageCellProps
  rewards_past_cycle: RewardsCellProps
  rewards_upcoming: RewardsCellProps
  allocations: AllocationCellProps
  actions: ActionCellProps
}

export type BuilderRowData = RowData<ColumnId, ColumnIdToCellPropsMap[ColumnId]>

export const convertDataToRowData = (
  data: BuildersRewards[],
  userAllocations: (bigint | undefined)[],
  prices: GetPricesResult,
  handleAction: (action: Action, builder: Builder) => void,
): Row<ColumnId>[] => {
  // FIXME: fix the Row type to take a generic for custom RowData type

  if (!data.length) return []

  return data.map<{ id: Address; data: ColumnIdToCellPropsMap }>((builder, index) => {
    const allocation = userAllocations[index] ?? 0n
    const actionType = getActionType(builder, allocation > 0n)

    const rifPrice = prices[RIF]?.price ?? 0
    const formattedAmount = formatSymbol(allocation, 'stRIF')
    const formattedUsdAmount = formatCurrency(getFiatAmount(allocation, rifPrice), { currency: 'USD' })

    return {
      id: builder.address,
      data: {
        builder: {
          builder,
        },
        backer_rewards: {
          percentage: builder.rewardPercentage ?? { current: 50n, next: 30n, cooldownEndTime: 100n },
        },
        rewards_past_cycle: {
          rbtcValue: builder.lastCycleRewards.rbtc.amount.value,
          rifValue: builder.lastCycleRewards.rif.amount.value,
          usdValue: getFiatAmount(builder.lastCycleRewards.rif.amount.value, rifPrice).toNumber(),
        },
        rewards_upcoming: {
          rbtcValue: builder.estimatedRewards.rbtc.amount.value,
          rifValue: builder.estimatedRewards.rif.amount.value,
          usdValue: getFiatAmount(builder.estimatedRewards.rif.amount.value, rifPrice).toNumber(),
        },
        backing: {
          amount: allocation,
          formattedAmount: formattedAmount,
          formattedUsdAmount: formattedUsdAmount,
        },
        allocations: {
          allocationPct: builder.totalAllocationPercentage,
        },
        actions: {
          actionType,
          onClick: () => {
            handleAction(actionType, builder)
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

export const TableCell: FC<
  HtmlHTMLAttributes<HTMLTableCellElement> & { columnId: ColumnId; forceShow?: boolean }
> = ({ children, className, onClick, columnId, forceShow }) => {
  const { columns } = useTableContext<ColumnId>()
  if (forceShow || !columns.find(col => col.id === columnId)?.hidden) {
    return (
      <td
        className={cn('flex self-stretch items-center', COLUMN_TRANFORMS[columnId], className)}
        onClick={onClick}
      >
        {children}
      </td>
    )
  }

  return null
}

const BackerRewardsCell = (props: BackersPercentageCellProps): ReactElement => {
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

const BuilderBackingCell = (props: BackingCellProps): ReactElement => {
  return (
    <TableCell columnId="backing" className="flex flex-col gap-2 align-middle justify-center">
      <BackingCell {...props} />
    </TableCell>
  )
}

const BuilderAllocationsCell = (props: AllocationCellProps): ReactElement => {
  return (
    <TableCell columnId="allocations" className="justify-center">
      <AllocationCell {...props} className="w-[60%] justify-center" />
    </TableCell>
  )
}

const BuilderActionsCell = ({
  className,
  forceShow,
  ...props
}: ActionCellProps & { forceShow?: boolean }): ReactElement => {
  return (
    <TableCell
      columnId="actions"
      className={cn('border-solid align-center w-full', className)}
      forceShow={forceShow}
    >
      {forceShow && <ActionCell {...props} />}
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
      allocations: { allocationPct },
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
      <BuilderBackingCell {...backing} />
      {!isHovered && <BuilderAllocationsCell allocationPct={allocationPct} />}
      <BuilderActionsCell {...actions} forceShow={isHovered} />
      <td className="w-[24px]"></td>
    </tr>
  )
}
