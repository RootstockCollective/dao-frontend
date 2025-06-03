import { DraggableAttributes } from '@dnd-kit/core/dist/hooks/useDraggable'
import { SixDotsIcon } from '../Icons/SixDotsIcon'
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
      className="cursor-grab flex items-center px-1 select-none user-select-none h-full align-self-stretch bg-[rgba(255,255,255,0.06)]"
      aria-label="Drag to reorder"
      tabIndex={0}
    >
      <SixDotsIcon />
    </div>
  )
}
