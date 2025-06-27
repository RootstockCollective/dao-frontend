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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clip-path="url(#clip0_4563_63)">
        <path
          d="M6 18L18 6"
          stroke="white"
          stroke-width="1.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8.25 6H18V15.75"
          stroke="white"
          stroke-width="1.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4563_63">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
