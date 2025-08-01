import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from './constants'

export function HourglassIcon({
  'aria-label': ariaLabel = 'Hourglass Icon',
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 12L7.25 8.675C7.17238 8.62066 7.10938 8.55021 7.06598 8.46921C7.02259 8.38821 7 8.29889 7 8.20833V5.58333C7 5.42862 7.06585 5.28025 7.18306 5.17085C7.30027 5.06146 7.45924 5 7.625 5H16.375C16.5408 5 16.6997 5.06146 16.8169 5.17085C16.9342 5.28025 17 5.42862 17 5.58333V8.18208C16.9997 8.27203 16.9771 8.36069 16.934 8.44114C16.8909 8.52158 16.8285 8.59164 16.7516 8.64583L12 12Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12L7.25 15.325C7.17238 15.3793 7.10938 15.4498 7.06598 15.5308C7.02259 15.6118 7 15.7011 7 15.7917V18.4167C7 18.5714 7.06585 18.7197 7.18306 18.8291C7.30027 18.9385 7.45924 19 7.625 19H16.375C16.5408 19 16.6997 18.9385 16.8169 18.8291C16.9342 18.7197 17 18.5714 17 18.4167V15.8179C16.9999 15.7277 16.9775 15.6388 16.9344 15.5581C16.8913 15.4773 16.8287 15.407 16.7516 15.3527L12 12Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
