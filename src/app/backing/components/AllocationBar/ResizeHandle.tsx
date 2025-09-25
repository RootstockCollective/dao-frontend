import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'

export const ResizeHandle = ({
  isEditable,
  isHighlighted,
  ...props
}: CommonComponentProps<HTMLDivElement> & {
  isHighlighted: boolean
  isEditable: boolean
}) => {
  const cursorClass = isEditable ? 'cursor-ew-resize' : 'cursor-not-allowed'

  // FIXME: This is a temporary hack to allow resizing a 0value segment.
  // It couples it with the AllocationBarSegment implementation, though,
  // so it should be removed once we have a better solution.
  const zIndexHack = 'z-75'

  return (
    <div
      className={cn(
        'w-2 h-full flex items-center justify-center bg-v3-bg-accent-100',
        zIndexHack,
        cursorClass,
      )}
      {...props}
    >
      <div
        className={`h-5 w-0.5 bg-v3-text-100 self rounded ${isHighlighted ? 'shadow-[0_0_8px_2px_#fff]' : ''}`}
      />
    </div>
  )
}
