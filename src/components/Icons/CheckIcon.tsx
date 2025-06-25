import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from './constants'

export function CheckIcon({
  'aria-label': ariaLabel = 'Check Priority Icon',
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  fill = 'none',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      aria-label={ariaLabel}
      {...props}
    >
      <path
        d="M10.2472 17L18 9.05889L16.9662 8L10.2472 14.8822L7.03378 11.5907L6 12.6496L10.2472 17Z"
        fill={color}
      />
      <path
        d="M18 9.05889L10.2472 17L6 12.6496L7.03378 11.5907L10.2472 14.8822L16.9662 8L18 9.05889Z"
        fill={color}
      />
    </svg>
  )
}

export default CheckIcon
