import { EllipseIcon } from '@/components/Icons/EllipseIcon'
import { CheckIcon } from '@/components/Icons/CheckIcon'
import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'

export interface SelectorCellProps extends CommonComponentProps {
  isSelected?: boolean
  isHovered?: boolean
  onClick?: () => void
}

const SIZE_ICONS_PCT = 70

export function SelectorCell({
  children,
  isSelected = false,
  isHovered = false,
  className = '',
  onClick,
}: SelectorCellProps) {
  return (
    <div className={cn('relative', className)} onClick={onClick}>
      {children}

      {/* Show Ellipse icon on hover or when selected */}
      {(isHovered || isSelected) && (
        <EllipseIcon
          className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-v3-bg-accent-100 z-10 bg-v3-text-80 rounded-full"
          style={{
            width: `${SIZE_ICONS_PCT}%`,
            height: `${SIZE_ICONS_PCT}%`,
          }}
        />
      )}

      {/* Show CheckIcon icon on top when selected */}
      {isSelected && (
        <CheckIcon
          className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-v3-bg-accent-100 z-20 bg-transparent"
          style={{
            width: `${SIZE_ICONS_PCT}%`,
            height: `${SIZE_ICONS_PCT}%`,
          }}
        />
      )}
    </div>
  )
}

export default SelectorCell
