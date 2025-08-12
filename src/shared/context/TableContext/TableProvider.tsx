'use client'

import { CommonComponentProps } from '@/components/commonProps'
import { FC, ReactElement, useReducer } from 'react'
import { TableActionsContext } from './TableActionsContext'
import { initialState, TableContext } from './TableContext'
import { tableReducer } from './tableReducer'
import { BaseColumnId, TableState } from './types'

export const TableProvider = <
  ColumnId extends BaseColumnId = BaseColumnId,
  CellDataMap extends Record<ColumnId, unknown> = Record<ColumnId, unknown>,
>({
  children,
}: CommonComponentProps): ReactElement => {
  const [state, dispatch] = useReducer(tableReducer, initialState as TableState<ColumnId, CellDataMap>)

  return (
    <TableContext value={state}>
      <TableActionsContext value={dispatch}>{children}</TableActionsContext>
    </TableContext>
  )
}

export const withTableContext = <
  ColumnId extends BaseColumnId = BaseColumnId,
  CellDataMap extends Record<ColumnId, unknown> = Record<ColumnId, unknown>,
>(
  Component: FC<CommonComponentProps>,
) => {
  const WrappedComponent = (props: CommonComponentProps): ReactElement => {
    return (
      <TableProvider<ColumnId, CellDataMap>>
        <Component {...props} />
      </TableProvider>
    )
  }
  WrappedComponent.displayName = `withTableContext(${Component.displayName || Component.name || 'Component'})`
  return WrappedComponent
}
