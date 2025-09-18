import { cn } from '@/lib/utils'

export const AllocationBarResizeHandle = ({
  onHandleMouseDown,
  dragIndex,
  isEditable,
  index,
}: {
  onHandleMouseDown: (idx: number) => (e: React.MouseEvent) => void
  dragIndex: number | null
  isEditable: boolean | (() => boolean)
  index: number
}) => {
  const cursorClass = isEditable ? 'cursor-ew-resize' : 'cursor-not-allowed'
  return (
    <div
      className={cn('w-2 h-full flex items-center justify-center z-10 bg-v3-bg-accent-100', cursorClass)}
      onMouseDown={onHandleMouseDown(index)}
    >
      <div
        className={`h-5 w-0.5 bg-v3-text-100 self rounded ${dragIndex === index ? 'shadow-[0_0_8px_2px_#fff]' : ''}`}
      />
    </div>
  )
}
