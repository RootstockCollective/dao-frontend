import { type IconProps } from './types'
import { DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR } from './constants'

export function UsersIcon({
  'aria-label': ariaLabel = 'Users Icon',
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  fill = 'none',
  strokeWidth = 2,
  stroke = color,
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
