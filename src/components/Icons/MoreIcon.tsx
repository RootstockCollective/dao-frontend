import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from './constants'

export function MoreIcon({
  'aria-label': ariaLabel = 'More Icon',
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_3855_5851)">
        <path
          d="M12 4.1875C12.7939 4.1875 13.4375 4.83109 13.4375 5.625C13.4375 6.41891 12.7939 7.0625 12 7.0625C11.2061 7.0625 10.5625 6.41891 10.5625 5.625C10.5625 4.83109 11.2061 4.1875 12 4.1875Z"
          fill={color}
          stroke={color}
          strokeWidth="0.125"
        />
        <path
          d="M12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5Z"
          fill={color}
        />
        <path
          d="M12 19.875C12.8284 19.875 13.5 19.2034 13.5 18.375C13.5 17.5466 12.8284 16.875 12 16.875C11.1716 16.875 10.5 17.5466 10.5 18.375C10.5 19.2034 11.1716 19.875 12 19.875Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_3855_5851">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default MoreIcon
