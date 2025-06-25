import React from 'react'
import { EllipseIcon } from '../Icons/EllipseIcon'
import { CheckPriorityIcon } from '../Icons/CheckPriority'

export interface SelectorCellProps {
  children: React.ReactNode
  isSelected?: boolean
  isHovered?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

const SIZE_ICONS_PCT = 70

export function SelectorCell({
  children,
  isSelected = false,
  isHovered = false,
  className = '',
  style,
  onClick,
}: SelectorCellProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...style,
      }}
      onClick={onClick}
    >
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

      {/* Show CheckPriority icon on top when selected */}
      {isSelected && (
        <CheckPriorityIcon
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
