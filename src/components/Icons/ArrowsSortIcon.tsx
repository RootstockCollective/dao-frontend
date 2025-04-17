import { DEFAULT_ICON_COLOR } from './constants'
import { IconProps } from './types'

export function ArrowsSortIcon({
  'aria-label': ariaLabel = 'Arrows Sort Icon',
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
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M3 9l4 -4l4 4m-4 -4v14" />
      <path d="M21 15l-4 4l-4 -4m4 4v-14" />
    </svg>
  )
}
