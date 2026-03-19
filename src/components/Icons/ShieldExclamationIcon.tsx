import { DEFAULT_ICON_SIZE } from './constants'
import { type IconProps } from './types'

/** Shield with exclamation mark (e.g. KYB rejected, eligibility warning). */
export function ShieldExclamationIcon({
  size = DEFAULT_ICON_SIZE,
  fill = 'currentColor',
  'aria-hidden': ariaHidden = true,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3zm0 10a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1zm0 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
        fill={fill}
      />
    </svg>
  )
}
