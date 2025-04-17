import { DEFAULT_ICON_COLOR } from './constants'
import { IconProps } from './types'

export function SortDescendingIcon({
  'aria-label': ariaLabel = 'Sort Descending Icon',
  size = 16,
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
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M4 6l9 0" />
      <path d="M4 12l7 0" />
      <path d="M4 18l7 0" />
      <path d="M15 15l3 3l3 -3" />
      <path d="M18 6l0 12" />
    </svg>
  )
}
