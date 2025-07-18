'use client'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { Builder } from '@/app/collective-rewards/types'
import { getCombinedFiatAmount } from '@/app/collective-rewards/utils'
import { GetPricesResult } from '@/app/user/types'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { RIF } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { Row, RowData, useTableActionsContext, useTableContext } from '@/shared/context'
import { FC, HtmlHTMLAttributes, ReactElement, useContext, useState } from 'react'
import { Address } from 'viem'
import { COLUMN_TRANSFORMS, ColumnId } from './BackerRewardsTable.config'
import {
  Action,
  ActionCell,
  ActionCellProps,
  getActionType,
} from '@/app/builders/components/Table/Cell/ActionCell'
import {
  BackersPercentageCell,
  BackersPercentageCellProps,
} from '@/app/builders/components/Table/Cell/BackersPercentageCell'
import { BackingCell, BackingCellProps } from '@/app/builders/components/Table/Cell/BackingCell'
import { BuilderNameCell, BuilderNameCellProps } from '@/app/builders/components/Table/Cell/BuilderNameCell'
import { RewardsCell, RewardsCellProps } from '@/app/builders/components/Table/Cell/RewardsCell'
import { SelectorCell } from '@/app/builders/components/Table/Cell/SelectorCell'
import { BackerRewards } from '@/app/collective-rewards/rewards/backers/hooks'
import { Paragraph } from '@/components/TypographyNew'
import { Tooltip, TooltipContent, TooltipPortal, TooltipTrigger } from '@radix-ui/react-tooltip'

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

export const convertDataToRowData = (
  data: BackerRewards[],
  prices: GetPricesResult,
  handleAction: (action: Action, builder: Builder) => void,
): Row<ColumnId>[] => {
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
            handleAction(actionType, builder)
          },
        },
      },
    }
  })
}

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
        className={cn('flex self-stretch items-center select-none', COLUMN_TRANSFORMS[columnId], className)}
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

const BuilderBackingCell = (props: BackingCellProps): ReactElement => {
  return (
    <TableCell columnId="backing" className="flex flex-col gap-2 align-middle justify-center">
      <BackingCell {...props} />
    </TableCell>
  )
}

const BackerRewardsActionsCell = ({
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

interface BackerRewardsDataRowProps {
  row: Row<ColumnId>
}

const selectedRowStyle = 'bg-v3-text-80 text-v3-bg-accent-100'
const unselectedRowStyle = 'bg-v3-bg-accent-80 text-v3-primary-100'

export const BackerRewardsDataRow: FC<BackerRewardsDataRowProps> = ({ row, ...props }) => {
  const {
    id: rowId,
    data: { builder, backing, backer_rewards, unclaimed, estimated, total, actions },
  } = row as Row<ColumnId> & { data: ColumnIdToCellPropsMap }
  const { selectedRows } = useTableContext<ColumnId>()

  const [isHovered, setIsHovered] = useState(false)
  const dispatch = useTableActionsContext<ColumnId>()
  const {
    actions: { toggleSelectedBuilder },
  } = useContext(AllocationsContext)

  const hasSelections = Object.values(selectedRows).some(Boolean)

  const handleToggleSelection = () => {
    dispatch({
      type: 'TOGGLE_ROW_SELECTION',
      payload: rowId,
    })
    toggleSelectedBuilder(rowId as Address) // TODO: do we need both?
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
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
            {!isHovered && <BuilderBackingCell {...backing} />}
            <BackerRewardsActionsCell {...actions} forceShow={isHovered} />
            <td className="w-[24px]"></td>
          </tr>
        </TooltipTrigger>
        {!hasSelections && <SelectBuildersTooltip />}
      </Tooltip>
    </>
  )
}

const SelectBuildersTooltip = () => {
  return (
    <TooltipPortal>
      <TooltipContent id={'select-builders-tooltip'} side="top" align="start" className="ml-16">
        <div className="flex justify-center">
          <div className="bg-v3-text-80 rounded-sm shadow-sm w-64 flex flex-col items-start p-6 gap-2">
            <Paragraph className="text-v3-bg-accent-100 text-sm w-full font-normal leading-5 rootstock-sans self-stretch">
              Click table line to select the Builder(s) that you’d like to back
            </Paragraph>
          </div>
        </div>
      </TooltipContent>
    </TooltipPortal>
  )
}
