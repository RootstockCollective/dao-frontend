import { DEFAULT_ICON_SIZE } from './constants'
import { type IconProps } from './types'

/**
 * Sushi (SushiSwap) brand mark, drawn as a circular badge: the official maki-roll mark on
 * Sushi's dark brand background.
 *
 * The mark itself is Sushi's own artwork, kept verbatim in its native 990x916 space and scaled
 * into the badge, so the blue-to-pink gradient is exactly the official one.
 *
 * This is a third-party trademark used only to identify the service being linked to, so the
 * brand colours are fixed: unlike the monochrome icons in this folder it deliberately ignores
 * `color` / `fill` / `stroke` (they are pinned after the prop spread). Only `size`, `className`
 * and the remaining SVG props have an effect.
 */
export function SushiIcon({
  'aria-label': ariaLabel = 'Sushi Icon',
  size = DEFAULT_ICON_SIZE,
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-label={ariaLabel}
      {...props}
      fill="none"
      stroke="none"
    >
      <circle cx="12" cy="12" r="12" fill="#0E0F23" />
      <g transform="translate(3.59 4.22) scale(0.017)">
        <path
          fill="url(#sushiIconGradient)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M969.311 593.493l-193.11 269.99c-28.12 39.37-82.96 56.71-152.8 51.09-97.03-8.44-225.93-60-349.2-148.58a975.047 975.047 0 01-113.6-94.36c-65.32-63.44-113.33-129.44-139.04-188.29-28.12-64.68-29.05-121.86-.93-161.23L214.2 52.123c28.13-39.37 82.5-56.71 152.81-51.09 97.03 7.97 225.46 60 349.19 148.12 123.28 88.59 213.75 194.05 252.18 283.11 3.32 7.64 6.26 15.17 8.82 22.59 19.11 55.35 16.91 103.92-7.89 138.64z"
        />
        <path
          fill="#fff"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M938.381 445.383c-37.03-84.84-123.75-184.68-241.86-269.05-117.65-84.37-239.98-134.52-332.32-142.02-56.25-4.69-100.78 5.63-123.27 37.03l-.95 1.87c-21.09 31.41-16.4 75.94 5.63 126.56 37.03 85.31 123.74 185.14 241.4 269.51 117.64 84.371 239.98 134.53 332.31 142.03 55.31 4.21 98.91-5.629 121.87-35.159l1.41-2.341c22.5-30.94 17.81-76.87-4.22-128.43zm-172.96 1.88c-10.31 14.52-31.4 18.75-57.18 16.4-46.41-3.75-107.34-29.06-166.4-71.24-59.06-42.19-102.65-91.88-120.93-134.53-10.31-23.9-13.12-44.99-2.81-59.53 10.32-14.53 31.41-18.75 57.65-16.87 45.93 4.22 107.34 29.06 165.93 71.25 59.06 42.18 102.65 92.33 120.93 134.99 10.78 23.9 13.59 44.99 2.81 59.53z"
        />
      </g>
      <defs>
        <linearGradient
          id="sushiIconGradient"
          x1="336.076"
          x2="653.893"
          y1="-11.067"
          y2="926.765"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#27B0E6" />
          <stop offset="0.107" stopColor="#49A1DB" />
          <stop offset="0.288" stopColor="#7D8ACA" />
          <stop offset="0.445" stopColor="#A279BD" />
          <stop offset="0.572" stopColor="#BA6FB6" />
          <stop offset="0.651" stopColor="#C26BB3" />
          <stop offset="0.678" stopColor="#D563AD" />
          <stop offset="0.715" stopColor="#E65BA7" />
          <stop offset="0.76" stopColor="#F156A3" />
          <stop offset="0.824" stopColor="#F853A1" />
          <stop offset="1" stopColor="#FA52A0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
