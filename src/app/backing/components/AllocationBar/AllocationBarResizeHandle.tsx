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
  const canEdit = typeof isEditable === 'function' ? isEditable() : isEditable
  const cursorClass = canEdit ? 'cursor-ew-resize' : 'cursor-not-allowed'
  return (
    <div
      className={`w-2 h-full flex items-center justify-center z-10 ml-1 mr-1 bg-transparent absolute -right-3 top-0 bottom-0 ${cursorClass}`}
      onMouseDown={onHandleMouseDown(index)}
    >
      <div
        className={`h-5 w-0.5 bg-white rounded ${dragIndex === index ? 'shadow-[0_0_8px_2px_#fff]' : ''}`}
      />
    </div>
  )
}
