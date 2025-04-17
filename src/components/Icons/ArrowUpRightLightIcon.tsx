import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR } from './constants'

export function ArrowUpRightLightIcon({
  'aria-label': ariaLabel = 'Arrow Up Right Light Icon',
  size = 16,
  color = DEFAULT_ICON_COLOR,
  fill = color,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M198,64V168a6,6,0,0,1-12,0V78.48L68.24,196.24a6,6,0,0,1-8.48-8.48L177.52,70H88a6,6,0,0,1,0-12H192A6,6,0,0,1,198,64Z" />
    </svg>
  )
}
