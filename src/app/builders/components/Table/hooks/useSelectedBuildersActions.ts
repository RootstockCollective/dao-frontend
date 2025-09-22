import { useTableContext } from '@/shared/context'
import { redirect, RedirectType } from 'next/navigation'
import { useMemo } from 'react'
import { Address } from 'viem'
import { Action } from '../Cell/ActionCell'
import { BuilderCellDataMap, ColumnId } from '../BuilderTable.config'

// Pure function that calculates action state - no React dependencies
export const getSelectedBuildersActionState = (actions: Action[], selectedBuilderIds: string[]) => {
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

// Hook that uses table context
export const useSelectedBuildersActions = (actions: Action[]) => {
  const { selectedRows } = useTableContext<ColumnId, BuilderCellDataMap>()

  const selectedBuilderIds = useMemo(
    () => Object.keys(selectedRows).filter(id => selectedRows[id]) as Address[],
    [selectedRows],
  )

  return useMemo(
    () => getSelectedBuildersActionState(actions, selectedBuilderIds),
    [actions, selectedBuilderIds],
  )
}
