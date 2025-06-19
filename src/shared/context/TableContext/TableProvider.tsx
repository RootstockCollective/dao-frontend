import { FC, PropsWithChildren, useReducer } from 'react'
import { TableActionsContext } from './TableActionsContext'
import { initialState, TableContext } from './TableContext'
import { tableReducer } from './tableReducer'

export const TableProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(tableReducer, initialState)

  return (
    <TableContext value={state}>
      <TableActionsContext value={dispatch}>{children}</TableActionsContext>
    </TableContext>
  )
}

export const withTableContext = (Component: FC<PropsWithChildren>) => {
  const WrappedComponent = (props: PropsWithChildren) => {
    return (
      <TableProvider>
        <Component {...props} />
      </TableProvider>
    )
  }
  WrappedComponent.displayName = `withTableContext(${Component.displayName || Component.name || 'Component'})`
  return WrappedComponent
}
