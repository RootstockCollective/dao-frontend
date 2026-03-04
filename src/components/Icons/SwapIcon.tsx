import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from './constants'
import { type IconProps } from './types'

export function SwapIcon({
  'aria-label': ariaLabel = 'Swap Icon',
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  fill = color,
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      {...props}
    >
      <path
        d="M7.30775 18.9808L3 14.673L7.30775 10.3655L8.0155 11.0788L4.92125 14.173H12.3077V15.173H4.92125L8.0155 18.2673L7.30775 18.9808ZM16.6923 13.6155L15.9845 12.902L19.0788 9.80775H11.6923V8.80775H19.0788L15.9845 5.7135L16.6923 5L21 9.30775L16.6923 13.6155Z"
        fill={fill}
      />
    </svg>
  )
}
