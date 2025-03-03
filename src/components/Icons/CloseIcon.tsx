import { DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR } from './constants'
import { IconProps } from './types'

export function CloseIcon({
  'aria-label': ariaLabel = 'Close Icon',
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
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}
