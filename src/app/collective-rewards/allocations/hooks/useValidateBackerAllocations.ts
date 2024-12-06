import { useContext } from 'react'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

export const useValidateBackerAllocations = () => {
  const {
    state: { selections, allocations },
  } = useContext(AllocationsContext)

  const isSelectionsEmpty = Object.values(selections).every(value => !value)
  const isAllocationsEmpty = !Object.keys(allocations).length

  return isSelectionsEmpty && isAllocationsEmpty
}
