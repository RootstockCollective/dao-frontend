import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR } from './constants'

export function ArrowRightIcon({
  'aria-label': ariaLabel = 'Arrow Right Icon',
  size = 16,
  color = DEFAULT_ICON_COLOR,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-label={ariaLabel}
      {...props}
    >
      <path
        d="M2.5 8L13.5 8"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 3.5L13.5 8L9 12.5"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default ArrowRightIcon
