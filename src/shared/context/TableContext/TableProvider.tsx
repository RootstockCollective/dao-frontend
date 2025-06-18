'use client'

import { CommonComponentProps } from '@/components/commonProps'
import { FC, ReactElement, useReducer } from 'react'
import { TableActionsContext } from './TableActionsContext'
import { initialState, TableContext } from './TableContext'
import { tableReducer } from './tableReducer'

export const TableProvider = <ColumnId extends string = string, Action extends string = string>({
  children,
}: CommonComponentProps): ReactElement => {
  const [state, dispatch] = useReducer(tableReducer, initialState)

  return (
    <TableContext value={state}>
      <TableActionsContext value={dispatch}>{children}</TableActionsContext>
    </TableContext>
  )
}

export const withTableContext = <ColumnId extends string = string, Action extends string = string>(
  Component: FC<CommonComponentProps>,
) => {
  const WrappedComponent = (props: CommonComponentProps): ReactElement => {
    return (
      <TableProvider<ColumnId, Action>>
        <Component {...props} />
      </TableProvider>
    )
  }
  WrappedComponent.displayName = `withTableContext(${Component.displayName || Component.name || 'Component'})`
  return WrappedComponent
}
