import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from './constants'

export function KotoChevronDownIcon({
  'aria-label': ariaLabel = 'Chevron Up Icon',
  size = DEFAULT_ICON_SIZE,
  color = '#171412',
  fill = color,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <g clip-path="url(#clip0_9188_12473)">
        <path
          d="M19 8L12 16L5 8"
          stroke={color}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_9188_12473">
          <rect width="24" height="24" fill="white" transform="translate(0 24) rotate(-90)" />
        </clipPath>
      </defs>
    </svg>
  )
}
