import { EllipseIcon } from '@/components/Icons/EllipseIcon'
import { CheckIcon } from '@/components/Icons/CheckIcon'
import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'

interface SelectorCellProps extends CommonComponentProps {
  isSelected?: boolean
  isHovered?: boolean
  canHover?: boolean
  onClick?: () => void
}

const SIZE_ICONS_PCT = 70

export function SelectorCell({
  children,
  isSelected = false,
  isHovered = false,
  canHover = true,
  className = '',
  onClick,
}: SelectorCellProps) {
  return (
    <div className={cn('relative', className)} onClick={onClick}>
      {children}

      {/* Show Ellipse icon on hover (CSS-based) or when selected */}
      <EllipseIcon
        className={cn(
          "absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-v3-bg-accent-100 z-10",
          "opacity-0 transition-opacity duration-150",
          canHover && "group-hover:opacity-100",
          isSelected && "opacity-100"
        )}
        style={{
          width: `${SIZE_ICONS_PCT}%`,
          height: `${SIZE_ICONS_PCT}%`,
        }}
        fill="var(--color-v3-text-80)"
      />

      {/* Show CheckIcon icon on top when selected */}
      {isSelected && (
        <CheckIcon
          className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-v3-bg-accent-100 z-20"
          style={{
            width: `${SIZE_ICONS_PCT}%`,
            height: `${SIZE_ICONS_PCT}%`,
          }}
        />
      )}
    </div>
  )
}
