import { type IconProps } from './types'
import { DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR } from './constants'

export function PlusCircleIcon({
  'aria-label': ariaLabel = 'Plus Circle Icon',
  size = DEFAULT_ICON_SIZE,
  fill = 'none',
  stroke = DEFAULT_ICON_COLOR,
  strokeWidth = 2,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}
