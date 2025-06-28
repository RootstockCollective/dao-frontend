import { type IconProps } from './types'

export function CloseIconKoto({
  'aria-label': ariaLabel = 'Close Icon Koto',
  size = 20,
  color = 'var(--color-text-100)',
  stroke = color,
  strokeWidth = '1.25',
  ...props
}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M15.8334 4.16669L4.16675 15.8334M4.16675 4.16669L15.8334 15.8334"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
