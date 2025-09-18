import { FC, HtmlHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useAccount } from 'wagmi'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { BuilderCellDataMap, ColumnId, COLUMN_TRANSFORMS, ColumnTransforms } from './BuilderTable.config'
import { ActionCell, ActionCellProps } from './Cell/ActionCell'
import { BackersPercentageCell, BackersPercentageProps } from './Cell/BackersPercentageCell'
import { BackingCell, BackingCellProps } from './Cell/BackingCell'
import { BackingShareCell, BackingShareCellProps } from './Cell/BackingShareCell'
import { BuilderNameCell, BuilderNameCellProps } from './Cell/BuilderNameCell'
import { RewardsCell, RewardsCellProps } from './Cell/RewardsCell'
import { SelectorCell } from './Cell/SelectorCell'
import { ExpandChevron } from './components/ExpandChevron'

// TODO: @refactor move to app/components/Table/Cell/TableCell.tsx
export const TableCellBase = ({
  children,
  className,
  onClick,
  columnId,
  forceShow,
  columnTransforms,
}: HtmlHTMLAttributes<HTMLTableCellElement> & {
  columnId: ColumnId
  forceShow?: boolean
  columnTransforms: ColumnTransforms<ColumnId>
}): ReactNode => {
  const { columns } = useTableContext<ColumnId, BuilderCellDataMap>()
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
    <TableCellBase
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

interface BuilderCellProps extends BuilderNameCellProps {
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export const BuilderCell = (props: BuilderCellProps): ReactElement => {
  const { isExpanded, onToggleExpand, ...builderProps } = props
  const { selectedRows } = useTableContext<ColumnId, BuilderCellDataMap>()
  const isSelected = selectedRows[props.builder.address]
  const isDesktop = useIsDesktop()

  return (
    <TableCell key="builder" columnId="builder" className="justify-start gap-4">
      <SelectorCell
        isHovered={props.isHighlighted}
        isSelected={isSelected}
        className="md:pt-3 md:pb-3 rounded-full"
      >
        <Jdenticon className="rounded-full bg-white w-10" value={props.builder.address} />
      </SelectorCell>

      <BuilderNameCell {...builderProps} />

      {!isDesktop && <ExpandChevron isExpanded={Boolean(isExpanded)} onToggle={onToggleExpand} />}
    </TableCell>
  )
}

export const BackerRewardsCell = (props: BackersPercentageProps): ReactElement => {
  return (
    <TableCell columnId="backer_rewards" className="gap-2 flex justify-center">
      <BackersPercentageCell {...props} />
    </TableCell>
  )
}

export const RewardsPastCycleCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="rewards_past_cycle" className="justify-center">
      <RewardsCell {...props} />
    </TableCell>
  )
}

export const RewardsUpcomingCell = (props: RewardsCellProps): ReactElement => {
  return (
    <TableCell columnId="rewards_upcoming" className="justify-center">
      <RewardsCell {...props} />
    </TableCell>
  )
}

export const BuilderBackingCell = ({ className, ...props }: BackingCellProps): ReactElement => {
  return (
    <TableCell
      columnId="backing"
      className={cn('flex flex-col gap-2 align-middle justify-center', className)}
    >
      <BackingCell {...props} />
    </TableCell>
  )
}

export const BuilderBackingShareCell = ({ className, ...props }: BackingShareCellProps): ReactElement => {
  return (
    <TableCell columnId="backingShare" className={cn('justify-center', className)}>
      <BackingShareCell {...props} className="w-[60%] justify-center" />
    </TableCell>
  )
}

export const ActionsCell = ({
  className,
  forceShow,
  ...props
}: ActionCellProps & { forceShow?: boolean }): ReactElement => {
  const { isConnected } = useAccount()

  return (
    <TableCell
      columnId="actions"
      className={cn('border-solid align-center w-full', className)}
      forceShow={forceShow}
    >
      {forceShow && <ActionCell {...props} hidden={!isConnected} />}
    </TableCell>
  )
}
