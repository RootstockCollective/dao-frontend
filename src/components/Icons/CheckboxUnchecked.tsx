import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR } from './constants'

export function CheckboxUnchecked({
  'aria-label': ariaLabel = 'Checkbox Unchecked',
  size = 24,
  color = DEFAULT_ICON_COLOR,
  fill = color,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clip-path="url(#clip0_3718_29845)">
        <path
          d="M5 19L5 5.63636C5 5.46759 5.06705 5.30573 5.18639 5.18639C5.30573 5.06705 5.46759 5 5.63636 5L18.3636 5C18.5324 5 18.6943 5.06705 18.8136 5.18639C18.933 5.30573 19 5.46759 19 5.63636V18.3636C19 18.5324 18.933 18.6943 18.8136 18.8136C18.6943 18.933 18.5324 19 18.3636 19H5Z"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3718_29845">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CheckboxUnchecked
