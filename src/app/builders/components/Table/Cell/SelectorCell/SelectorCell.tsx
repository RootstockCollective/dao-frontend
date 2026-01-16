import { EllipseIcon } from '@/components/Icons/EllipseIcon'
import { CheckIcon } from '@/components/Icons/CheckIcon'
import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'

interface SelectorCellProps extends CommonComponentProps {
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
    <div
      className={cn(
        'relative transition-transform duration-500 ease-in-out',
        isSelected ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]',
        className,
      )}
      onClick={onClick}
    >
      {children}

      {/* Show Ellipse icon on hover or when selected */}
      <EllipseIcon
        className={cn(
          'absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-v3-bg-accent-100 z-base',
          'transition-opacity duration-300 ease-in-out',
          isHovered || isSelected ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          width: `${SIZE_ICONS_PCT}%`,
          height: `${SIZE_ICONS_PCT}%`,
        }}
        fill="var(--color-v3-text-80)"
      />

      {/* Show CheckIcon icon on top when selected */}
      <CheckIcon
        className={cn(
          'absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-v3-bg-accent-100 z-base',
          'transition-all duration-200 ease-in-out',
          isSelected ? 'rotate-y-180 opacity-100 delay-250' : 'opacity-0 delay-0 duration-100',
        )}
        style={{
          width: `${SIZE_ICONS_PCT}%`,
          height: `${SIZE_ICONS_PCT}%`,
        }}
      />
    </div>
  )
}
