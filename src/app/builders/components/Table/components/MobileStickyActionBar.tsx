import { Button } from '@/components/Button'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { DeselectIcon } from '@/components/Icons/DeselectIcon'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { redirect, RedirectType } from 'next/navigation'
import { FC } from 'react'
import { Address } from 'viem'
import { Action, ActionCell } from '../Cell/ActionCell'
import { BuilderCellDataMap, ColumnId } from '../BuilderTable.config'
import { Span } from '@/components/Typography'

interface MobileStickyActionBarProps {
  actions: Action[]
}

export const MobileStickyActionBar: FC<MobileStickyActionBarProps> = ({ actions }) => {
  const { selectedRows } = useTableContext<ColumnId, BuilderCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, BuilderCellDataMap>()

  const selectedBuilderIds = Object.keys(selectedRows).filter(id => selectedRows[id]) as Address[]
  const selectedCount = selectedBuilderIds.length

  if (selectedCount === 0) {
    return null
  }

  const isMultipleDifferentActions = actions.some(action => action !== actions[0])
  const showAction = isMultipleDifferentActions ? 'adjustBacking' : actions[0]

  const handleActionClick = () => {
    redirect(`/backing?builders=${selectedBuilderIds.join(',')}`, RedirectType.push)
  }

  const handleDeselectClick = () => {
    dispatch({ type: 'SET_SELECTED_ROWS', payload: {} })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-v3-bg-accent-100 pt-4 px-4">
      <ActionsContainer className="border-t border-v3-bg-accent-60 rounded-none">
        <div className="flex justify-center items-center gap-4 w-full">
          <ActionCell
            actionType={showAction}
            onClick={handleActionClick}
            className="justify-center text-v3-text-100 w-auto px-0"
          />
          <Button
            variant="transparent"
            onClick={handleDeselectClick}
            className="justify-center w-auto px-0 flex items-center gap-1"
          >
            <DeselectIcon size={20} />
            <div className="flex gap-2 font-normal">
              <Span>Deselect</Span>
              <Span className="text-v3-text-60">{selectedCount}</Span>
            </div>
          </Button>
        </div>
      </ActionsContainer>
    </div>
  )
}
