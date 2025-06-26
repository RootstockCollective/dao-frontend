import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR } from './constants'

export function ArrowUpRightLightIcon({
  'aria-label': ariaLabel = 'Arrow Up Right Light Icon',
  size = 16,
  color = DEFAULT_ICON_COLOR,
  fill = 'none',
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill={fill}
      {...props}
    >
      <g clip-path="url(#clip0_5261_3588)">
        <path d="M5 15L15 5" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M6.875 5H15V13.125"
          stroke={color}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_5261_3588">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
