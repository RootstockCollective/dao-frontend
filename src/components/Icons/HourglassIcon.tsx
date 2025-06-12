import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR } from './constants'

export function HourglassIcon({
  'aria-label': ariaLabel = 'Hourglass Icon',
  size = 16,
  color = DEFAULT_ICON_COLOR,
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
      <path
        d="M8 8L4.2 5.15C4.1379 5.10343 4.0875 5.04303 4.05279 4.97361C4.01807 4.90418 4 4.82762 4 4.75V2.5C4 2.36739 4.05268 2.24021 4.14645 2.14645C4.24021 2.05268 4.36739 2 4.5 2H11.5C11.6326 2 11.7598 2.05268 11.8536 2.14645C11.9473 2.24021 12 2.36739 12 2.5V4.7275C11.9998 4.80459 11.9817 4.88059 11.9472 4.94955C11.9127 5.0185 11.8628 5.07855 11.8013 5.125L8 8Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8L4.2 10.85C4.1379 10.8966 4.0875 10.957 4.05279 11.0264C4.01807 11.0958 4 11.1724 4 11.25V13.5C4 13.6326 4.05268 13.7598 4.14645 13.8536C4.24021 13.9473 4.36739 14 4.5 14H11.5C11.6326 14 11.7598 13.9473 11.8536 13.8536C11.9473 13.7598 12 13.6326 12 13.5V11.2725C12 11.1952 11.982 11.119 11.9475 11.0498C11.913 10.9806 11.863 10.9203 11.8013 10.8737L8 8Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default HourglassIcon
