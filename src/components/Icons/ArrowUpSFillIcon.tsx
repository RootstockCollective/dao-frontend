import { type IconProps } from './types'
import { DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR } from './constants'

export function ArrowUpSFillIcon({
  'aria-label': ariaLabel = 'Arrow Up Icon',
  size = DEFAULT_ICON_SIZE,
  fill = DEFAULT_ICON_COLOR,
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
      <path d="M12 8L18 14H6L12 8Z" />
    </svg>
  )
}
