import { type IconProps } from './types'

const DEFAULT_ICON_SIZE = 20

export function CloseIconKoto({
  'aria-label': ariaLabel = 'Close Icon Koto',
  size = DEFAULT_ICON_SIZE,
  color = 'var(--color-text-100)',
  stroke = color,
  strokeWidth = '1.25',
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-label={ariaLabel}
      {...props}
    >
      <path
        d="M15.8332 4.16663L4.1665 15.8333M4.1665 4.16663L15.8332 15.8333"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
