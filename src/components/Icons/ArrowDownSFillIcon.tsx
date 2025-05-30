import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR } from './constants'

export function ArrowDownSFillIcon({
  'aria-label': ariaLabel = 'Arrow Down Icon',
  size = 16,
  color = DEFAULT_ICON_COLOR,
  fill = color,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M12 16L6 10H18L12 16Z" />
    </svg>
  )
}
