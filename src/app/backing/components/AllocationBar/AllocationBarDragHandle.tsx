import { DraggableAttributes } from '@dnd-kit/core/dist/hooks/useDraggable'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities/useSyntheticListeners'

export const AllocationBarDragHandle = ({
  attributes,
  listeners,
}: {
  attributes: DraggableAttributes
  listeners?: SyntheticListenerMap
}) => {
  return (
    <div
      {...attributes}
      {...listeners}
      className="cursor-grab flex items-center px-1 select-none user-select-none h-full w-full"
      aria-label="Drag to reorder"
    />
  )
}
