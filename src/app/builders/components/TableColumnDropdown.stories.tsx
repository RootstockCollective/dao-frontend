import { TableColumnDropdown } from './TableColumnDropdown'
import { withTableContext } from '@/shared/context/TableContext'
import { useTableActionsContext } from '@/shared/context/TableContext'
import { useEffect } from 'react'

const TableColumnDropdownWithContext = () => {
  const dispatch = useTableActionsContext()

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: [
        { id: 'builder', label: 'Builder', sortable: true, hidden: false },
        { id: 'backing', label: 'Backing', sortable: true, hidden: false },
        { id: 'rewardsPercent', label: 'Rewards %', sortable: true, hidden: true },
        { id: 'change', label: 'Change', sortable: true, hidden: false },
        { id: 'rewardsPast', label: 'Rewards', sublabel: 'past cycle', sortable: true, hidden: true },
        {
          id: 'rewardsUpcoming',
          label: 'Rewards',
          sublabel: 'upcoming cycle',
          sortable: true,
          hidden: false,
        },
        { id: 'allocations', label: 'Allocations', sortable: true, hidden: false },
      ],
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
