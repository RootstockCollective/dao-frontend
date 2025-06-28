'use client'

import { Builder } from '@/app/collective-rewards/types'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { ArrowDownIcon, ArrowUpIcon } from '@/components/Icons'
import { Label } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { Column, RowData, useTableActionsContext, useTableContext } from '@/shared/context'
import { FC, HtmlHTMLAttributes } from 'react'
import { AllocationCell } from './AllocationCell'
import { COLUMN_WIDTHS, ColumnId, ColumnType } from './BuildersTable'
import { RewardsCell } from './RewardsCell'
import SelectorCell from './SelectorCell/SelectorCell'

const TableCell: FC<HtmlHTMLAttributes<HTMLTableCellElement> & { columnId: ColumnId }> = ({
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

const getDataCells = (row: RowData<ColumnId>, isSelected: boolean) => {
  const builder = row as unknown as Builder // TODO: Fix this type casting

  return {
    builder: () => (
      <TableCell key="builder" columnId="builder" className="justify-start">
        <SelectorCell isSelected={isSelected} className="pt-3 pb-3">
          <Jdenticon className="rounded-full bg-white w-10" value={builder.address} />
        </SelectorCell>
        <span className="ml-4">{builder.builderName}</span>
      </TableCell>
    ),
    backing: () => (
      <TableCell key="backing" columnId="backing">
        Backing Data
      </TableCell>
    ),
    rewards_percentage: () => (
      // TODO: REFACTOR
      <TableCell key="rewards_percentage" columnId="rewards_percentage" className="gap-2">
        {`${builder.backerRewardPercentage?.active ?? 0n}`}
        <div className="flex gap-0 items-center justify-center">
          {(builder.backerRewardPercentage?.active ?? 0n) - (builder.backerRewardPercentage?.previous ?? 0n) >
          0n ? (
            <ArrowUpIcon className="text-green-500" size={16} />
          ) : (
            <ArrowDownIcon className="text-red-500" size={16} />
          )}
          <Label
            className={cn(
              (builder.backerRewardPercentage?.active ?? 0n) -
                (builder.backerRewardPercentage?.previous ?? 0n) >
                0n
                ? 'text-green-500'
                : 'text-red-500',
            )}
          >
            {(builder.backerRewardPercentage?.active ?? 0n) -
              (builder.backerRewardPercentage?.previous ?? 0n)}
          </Label>
        </div>
      </TableCell>
    ),
    rewards_past_cycle: () => (
      <TableCell key="rewards_past_cycle" columnId="rewards_past_cycle">
        {`${builder.backerRewardPercentage?.previous?.toString() || 'N/A'}`}
      </TableCell>
    ),
    rewards_upcoming: () => (
      <TableCell key="rewards_upcoming" columnId="rewards_upcoming">
        <RewardsCell
          rbtcValue={builder.rewards?.next?.rbtc}
          rifValue={builder.rewards?.next?.rif}
          usdValue={builder.rewards?.next?.usd}
        />
      </TableCell>
    ),
    allocations: () => (
      <TableCell key="allocations" columnId="allocations">
        <AllocationCell allocationPct={Number(builder.allocations) * 10 ** -16} />
      </TableCell>
    ),
    actions: () => (
      <TableCell key="actions" columnId="actions" className="justify-start">
        Actions
      </TableCell>
    ),
  }
}

const renderDataCells = (
  columns: Column<ColumnId, ColumnType>[],
  cellConfigs: ReturnType<typeof getDataCells>,
) => {
  return columns.map(({ id, hidden }) => {
    if (hidden) return null

    const cellConfig = cellConfigs[id as keyof typeof cellConfigs]
    return cellConfig ? cellConfig() : null
  })
}

interface BuilderDataRowProps {
  row: RowData<ColumnId>
  columns: Column<ColumnId, ColumnType>[]
}

export const BuilderDataRow: FC<BuilderDataRowProps> = ({ row, columns }) => {
  const { selectedRows } = useTableContext<ColumnId, ColumnType>()
  const dispatch = useTableActionsContext<ColumnId, ColumnType>()

  const isSelected = selectedRows[row.id]

  const handleToggleSelection = () => {
    dispatch({
      type: 'TOGGLE_ROW_SELECTION',
      payload: row.id,
    })
  }

  const cellConfigs = getDataCells(row, isSelected, handleToggleSelection)
  const cells = renderDataCells(columns, cellConfigs)

  return <TableRow>{cells}</TableRow>
}

export const TableRow: FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tr className="flex border-b-v3-bg-accent-60 border-b-1">{children}</tr>
}
