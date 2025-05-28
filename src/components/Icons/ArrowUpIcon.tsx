import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR } from './constants'

export function ArrowUpIcon({
  'aria-label': ariaLabel = 'Arrow Up Icon',
  size = 16,
  color = DEFAULT_ICON_COLOR,
  fill = color,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M8 13.5V2.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M3.5 7L8 2.5L12.5 7"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default ArrowUpIcon
