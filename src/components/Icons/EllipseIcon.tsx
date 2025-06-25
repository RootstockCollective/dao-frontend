import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from './constants'

export function EllipseIcon({
  'aria-label': ariaLabel = 'Ellipse Icon',
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
      viewBox="0 0 28 28"
      width={size}
      height={size}
      fill={fill}
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="14" cy="14" r="13.5" fill={fill} stroke={color} />
    </svg>
  )
}

export default EllipseIcon
