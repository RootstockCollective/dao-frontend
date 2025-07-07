import { useTableActionsContext, withTableContext } from '@/shared/context/TableContext'
import { useEffect } from 'react'
import { ColumnId } from '../BuilderTable.types'
import { TableColumnDropdown } from './TableColumnDropdown'

const TableColumnDropdownWithContext = () => {
  const dispatch = useTableActionsContext<ColumnId>()

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: [
        { id: 'builder', sortable: true, hidden: false },
        { id: 'backing', sortable: true, hidden: false },
        { id: 'backer_rewards', sortable: true, hidden: false },
        { id: 'rewards_past_cycle', sortable: true, hidden: false },
        { id: 'rewards_upcoming', sortable: true, hidden: false },
        { id: 'allocations', sortable: true, hidden: false },
        { id: 'actions', sortable: false, hidden: true }, // should not be shown
      ],
    })
  }, [dispatch])

  return (
    <TableColumnDropdown className="flex justify-end items-start p-10 min-h-[200px] w-[500px] relative" />
  )
}

export default {
  title: 'Koto/Builders/Components/Table/TableColumnDropdown',
  component: TableColumnDropdown,
}

export const Basic = () => {
  const WrappedComponent = withTableContext(TableColumnDropdownWithContext)
  return <WrappedComponent />
}
