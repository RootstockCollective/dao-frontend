import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR } from './constants'

export function CheckboxChecked({
  'aria-label': ariaLabel = 'Checkbox Checked',
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
      <g clipPath="url(#clip0_3718_29849)">
        <path
          d="M18.3633 4.375C18.6978 4.375 19.0193 4.50759 19.2559 4.74414C19.4924 4.98069 19.625 5.30219 19.625 5.63672V18.3633C19.625 18.6978 19.4924 19.0193 19.2559 19.2559C19.0193 19.4924 18.6978 19.625 18.3633 19.625H5C4.65482 19.625 4.375 19.3452 4.375 19L4.375 5.63672C4.375 5.30218 4.50759 4.98069 4.74414 4.74414C4.98069 4.50759 5.30218 4.375 5.63672 4.375L18.3633 4.375ZM9.27246 9C9.20023 9.00007 9.13116 9.02899 9.08008 9.08008C9.02899 9.13116 9.00007 9.20023 9 9.27246L9 15L14.7275 15C14.7998 14.9999 14.8688 14.971 14.9199 14.9199C14.971 14.8688 14.9999 14.7998 15 14.7275L15 9.27246C14.9999 9.20023 14.971 9.13116 14.9199 9.08008C14.8688 9.02899 14.7998 9.00007 14.7275 9L9.27246 9Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_3718_29849">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CheckboxChecked
