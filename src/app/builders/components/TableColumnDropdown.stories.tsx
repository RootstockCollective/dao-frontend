import { useTableActionsContext, withTableContext } from '@/shared/context/TableContext'
import { useEffect } from 'react'
import { ColumnId, ColumnType, DEFAULT_HEADERS } from './Table/BuildersTable'
import { TableColumnDropdown } from './TableColumnDropdown'

const TableColumnDropdownWithContext = () => {
  const dispatch = useTableActionsContext<ColumnId, ColumnType>()

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: DEFAULT_HEADERS,
    })
  }, [dispatch])

  return (
    <TableColumnDropdown className="flex justify-end items-start p-10 min-h-[200px] w-[500px] relative" />
  )
}

export default {
  title: 'Builders/TableColumnDropdown',
  component: TableColumnDropdown,
}

export const Basic = () => {
  const WrappedComponent = withTableContext(TableColumnDropdownWithContext)
  return <WrappedComponent />
}
