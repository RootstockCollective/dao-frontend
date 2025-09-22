import { useTableContext } from '@/shared/context'
import { redirect, RedirectType } from 'next/navigation'
import { Address } from 'viem'
import { Action } from '../Cell/ActionCell'
import { BuilderCellDataMap, ColumnId } from '../BuilderTable.config'

export const useSelectedBuildersActions = (actions: Action[]) => {
  const { selectedRows } = useTableContext<ColumnId, BuilderCellDataMap>()

  const selectedBuilderIds = Object.keys(selectedRows).filter(id => selectedRows[id]) as Address[]
  const selectedCount = selectedBuilderIds.length

  const isMultipleDifferentActions = actions.some(action => action !== actions[0])
  const showAction = isMultipleDifferentActions ? 'adjustBacking' : actions[0]

  const handleActionClick = () => {
    redirect(`/backing?builders=${selectedBuilderIds.join(',')}`, RedirectType.push)
  }

  return {
    selectedBuilderIds,
    selectedCount,
    showAction,
    handleActionClick,
  }
}
