'use client'

import {
  BuilderHeaderCell,
  BuilderHeaderCellBase,
  CombinedActionsHeaderCell,
  HeaderCellBase,
  HeaderSubtitle,
  HeaderTitle,
  TableColumnDropdown,
} from '@/app/builders/components/Table'
import { Action } from '@/app/builders/components/Table/Cell/ActionCell'
import { Button } from '@/components/ButtonNew'
import { CommonComponentProps } from '@/components/commonProps'
import { CloseIconKoto } from '@/components/Icons'
import { TableHeaderCell } from '@/components/TableNew'
import { useTableActionsContext } from '@/shared/context'
import { ReactNode, Suspense } from 'react'
import { COLUMN_TRANSFORMS, ColumnId, LABELS } from './BackerRewardsTable.config'

const HeaderCell = ({
  className,
  children,
  columnId,
  ...props
}: CommonComponentProps & { columnId: ColumnId }): ReactNode => {
  return (
    <HeaderCellBase<ColumnId>
      className={className}
      columnId={columnId}
      columnTransforms={COLUMN_TRANSFORMS}
      {...props}
    >
      {children}
    </HeaderCellBase>
  )
}

export type BackerRewardsHeaderRowProps = {
  actions: Action[]
}
export const BackerRewardsHeaderRow = ({ actions }: BackerRewardsHeaderRowProps) => {
  const dispatch = useTableActionsContext()
  const handleCancelActions = () => {
    dispatch({ type: 'SET_SELECTED_ROWS', payload: {} })
  }
  const actionCount = actions.length

  return (
    <Suspense fallback={<div>Loading table headers...</div>}>
      <tr className="flex border-b-1 border-b-v3-text-60 select-none gap-4">
        <BuilderHeaderCell key="builder" columnId="builder" />
        {actionCount <= 1 && (
          <>
            <HeaderCell key="backer_rewards" columnId="backer_rewards">
              <HeaderTitle>Backer Rewards</HeaderTitle>
              <HeaderSubtitle>current % - change</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell key="unclaimed" columnId="unclaimed">
              <HeaderTitle>Rewards</HeaderTitle>
              <HeaderSubtitle>past cycle</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell key="estimated" columnId="estimated">
              <HeaderTitle>Rewards</HeaderTitle>
              <HeaderSubtitle>upcoming cycle, estimated</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell key="total" columnId="total">
              <HeaderTitle>Total</HeaderTitle>
              <HeaderSubtitle>lifetime</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell key="backing" columnId="backing">
              <HeaderTitle>Backing</HeaderTitle>
              <HeaderSubtitle className="h-full text-v3-bg-accent-80">balls</HeaderSubtitle>{' '}
              {/* TODO: temporary fix to align the text to the top */}
            </HeaderCell>
            <HeaderCell columnId="actions">
              <HeaderTitle>Actions</HeaderTitle>
              <HeaderSubtitle className="h-full text-v3-bg-accent-80">balls</HeaderSubtitle>{' '}
              {/* TODO: temporary fix to align the text to the top */}
            </HeaderCell>
            <th>
              <TableColumnDropdown className="self-start" labels={LABELS} />
            </th>
          </>
        )}
        {actionCount > 1 && (
          <>
            <CombinedActionsHeaderCell actions={actions} />
            <TableHeaderCell contentClassName="items-start">
              <Button
                variant="secondary"
                className="p-0 border-none bg-inherit"
                onClick={handleCancelActions}
              >
                <CloseIconKoto className="w-5 h-5 text-v3-text-100" />
              </Button>
            </TableHeaderCell>
          </>
        )}
      </tr>
    </Suspense>
  )
}
