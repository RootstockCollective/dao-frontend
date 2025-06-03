export const AllocationBarResizeHandle = ({
  onHandleMouseDown,
  dragIndex,
  index,
}: {
  onHandleMouseDown: (idx: number) => (e: React.MouseEvent) => void
  dragIndex: number | null
  index: number
}) => {
  return (
    <div
      className="w-2 cursor-ew-resize h-full flex items-center justify-center z-10 ml-1 mr-1 bg-transparent absolute -right-0.5 top-0 bottom-0"
      onMouseDown={onHandleMouseDown(index)}
    >
      <div
        className={`h-5 w-0.5 bg-white rounded ${dragIndex === index ? 'shadow-[0_0_8px_2px_#fff]' : ''}`}
      />
    </div>
  )
}
