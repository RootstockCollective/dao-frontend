import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR } from './constants'

export function MinusIcon({
  'aria-label': ariaLabel = 'Minus Icon',
  size = 16,
  color = DEFAULT_ICON_COLOR,
  fill = color,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 448 512"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" />
    </svg>
  )
}
