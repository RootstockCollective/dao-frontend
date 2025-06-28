import { IconProps } from './types'

export function SearchIconKoto({
  'aria-label': ariaLabel = 'Search Icon Koto',
  size = 24,
  color = 'var(--color-text-100)',
  stroke = color,
  strokeWidth = '1.25',
  fill = 'none',
  ...props
}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} {...props}>
      <path
        d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.8027 15.8027L20.9993 20.9993"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
