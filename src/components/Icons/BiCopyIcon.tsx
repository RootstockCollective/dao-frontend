import { DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR } from './constants'
import { IconProps } from './types'

export function BiCopyIcon({
  'aria-label': ariaLabel = 'Bi Copy Icon',
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
      <path d="M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z" />
    </svg>
  )
}
