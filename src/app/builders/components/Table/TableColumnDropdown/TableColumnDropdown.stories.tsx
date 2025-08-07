import { useTableActionsContext, withTableContext } from '@/shared/context'
import { useEffect } from 'react'
import { BuilderCellDataMap, ColumnId, LABELS } from '../BuilderTable.config'
import { TableColumnDropdown } from './TableColumnDropdown'

const TableColumnDropdownWithContext = () => {
  const dispatch = useTableActionsContext<ColumnId, BuilderCellDataMap>()

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: [
        { id: 'builder', sortable: true, hidden: false },
        { id: 'backing', sortable: true, hidden: false },
        { id: 'backer_rewards', sortable: true, hidden: false },
        { id: 'rewards_past_cycle', sortable: true, hidden: false },
        { id: 'rewards_upcoming', sortable: true, hidden: false },
        { id: 'backingShare', sortable: true, hidden: false },
        { id: 'actions', sortable: false, hidden: true }, // should not be shown
      ],
    })
  }, [dispatch])

  return (
    <TableColumnDropdown
      className="flex justify-end items-start p-10 min-h-[200px] w-[500px] relative"
      labels={LABELS}
    />
  )
}

export default {
  title: 'Koto/Builders/Table/TableColumnDropdown',
  component: TableColumnDropdown,
}

const WrappedComponent = withTableContext<ColumnId, BuilderCellDataMap>(TableColumnDropdownWithContext)
export const Basic = () => {
  return <WrappedComponent />
}

export const TriggerInheritsBackground = () => {
  return (
    <div className="w-full h-full bg-green-700">
      <WrappedComponent />
    </div>
  )
}
