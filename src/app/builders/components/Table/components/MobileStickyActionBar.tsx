import { Button } from '@/components/Button'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { DeselectIcon } from '@/components/Icons/DeselectIcon'
import { useTableActionsContext } from '@/shared/context'
import { FC } from 'react'
import { Action, ActionCell } from '../Cell/ActionCell'
import { BuilderCellDataMap, ColumnId } from '../BuilderTable.config'
import {
  useSelectedBuildersActions,
  getSelectedBuildersActionState,
} from '../hooks/useSelectedBuildersActions'
import { Span } from '@/components/Typography'

interface MobileStickyActionBarProps {
  actions: Action[]
}

interface MobileStickyActionBarContentProps {
  actions: Action[]
  selectedCount: number
  selectedBuilderIds: string[]
  onDeselectAll: () => void
  onClose?: () => void
}

export const MobileStickyActionBarContent: FC<MobileStickyActionBarContentProps> = ({
  actions,
  selectedCount,
  selectedBuilderIds,
  onDeselectAll,
  onClose,
}) => {
  const { showAction, handleActionClick } = getSelectedBuildersActionState(actions, selectedBuilderIds)

  const handleDeselectClick = () => {
    onDeselectAll()
    onClose?.()
  }

  return (
    <div className="md:hidden bg-v3-bg-accent-100 pt-4 px-4">
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
