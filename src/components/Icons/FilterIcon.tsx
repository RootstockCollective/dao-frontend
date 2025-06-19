import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from './constants'
import { cn } from '@/lib/utils'

export function FilterIcon({
  'aria-label': ariaLabel = 'Filter Icon',
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  stroke = color,
  fill,
  ...props
}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label={ariaLabel} {...props}>
      <path
        d="M9.75 9.75C10.9926 9.75 12 8.74264 12 7.5C12 6.25736 10.9926 5.25 9.75 5.25C8.50736 5.25 7.5 6.25736 7.5 7.5C7.5 8.74264 8.50736 9.75 9.75 9.75Z"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        /* if `fill` is not defined, use `bg-80` as a fill color */
        style={{ fill: fill ?? 'var(--background-80)' }}
      />
      <path
        d="M15.75 18.75C16.9926 18.75 18 17.7426 18 16.5C18 15.2574 16.9926 14.25 15.75 14.25C14.5074 14.25 13.5 15.2574 13.5 16.5C13.5 17.7426 14.5074 18.75 15.75 18.75Z"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ fill: fill ?? 'var(--background-80)' }}
      />
      <path
        d="M12 7.5L20.25 7.5"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 7.5L7.5 7.5"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 16.5H20.25"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 16.5H13.5"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
