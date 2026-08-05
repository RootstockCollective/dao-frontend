import { DEFAULT_ICON_SIZE } from './constants'
import { type IconProps } from './types'

/**
 * Oku (Oku Trade) brand mark. Oku only publishes this mark as a circular badge — the ring and
 * wave are defined against the dark disc — so the badge is the mark and cannot be separated
 * from it.
 *
 * Composition: the dark disc, an off-white disc for the ring, then the two dark lobes the wave
 * divides the inner circle into. The lobes reuse the disc gradient so they blend seamlessly.
 *
 * This is a third-party trademark used only to identify the service being linked to, so the
 * brand colours are fixed: unlike the monochrome icons in this folder it deliberately ignores
 * `color` / `fill` / `stroke` (they are pinned after the prop spread). Only `size`, `className`
 * and the remaining SVG props have an effect.
 */
export function OkuIcon({
  'aria-label': ariaLabel = 'Oku Icon',
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
      <circle cx="12" cy="12" r="12" fill="url(#okuIconGradient)" />
      <circle cx="12" cy="12" r="9.75" fill="#F5F6FC" />
      <path
        fill="url(#okuIconGradient)"
        d="M11.77 3.98L12.94 4.03L14.48 4.36L15.98 5.02L16.03 5.11L16.22 5.16L16.27 5.25L16.78 5.53L17.16 5.91L17.25 5.91L18.52 7.27L18.52 7.36L18.89 7.83L18.98 8.11L19.08 8.16L19.36 8.72L19.36 8.86L19.45 8.95L19.73 9.75L19.73 9.94L19.5 9.84L19.45 9.75L19.31 9.75L19.12 9.61L18.98 9.61L18.61 9.42L17.06 9.14L14.34 9.19L12.09 9.52L10.22 9.89L9.84 10.08L9.66 10.31L9.42 11.48L9.42 12.33L9.56 13.22L9.7 13.64L10.08 14.34L8.86 14.53L7.83 14.48L6.84 14.25L5.53 13.59L4.97 13.08L4.88 13.08L3.98 12.14L3.98 11.16L4.17 10.08L4.64 8.72L4.92 8.16L5.02 8.11L5.11 7.83L5.2 7.78L5.48 7.27L5.86 6.89L5.86 6.8L6.75 5.91L6.84 5.91L6.98 5.72L7.08 5.72L7.17 5.58L7.27 5.58L7.36 5.44L7.45 5.44L7.78 5.16L8.06 5.06L8.11 4.97L8.67 4.69L8.81 4.69L8.91 4.59L9.7 4.31L10.73 4.08Z"
      />
      <path
        fill="url(#okuIconGradient)"
        d="M15.14 10.88L16.83 10.88L17.58 10.97L18.42 11.2L18.89 11.44L19.12 11.67L19.22 11.67L19.55 12.05L19.83 12.7L19.92 13.45L19.73 14.25L19.5 14.95L19.36 15.14L19.36 15.28L19.08 15.84L18.98 15.89L18.89 16.17L18.8 16.22L18.52 16.73L18.14 17.11L18.14 17.2L16.78 18.47L16.69 18.47L16.22 18.84L16.03 18.89L15.98 18.98L15 19.45L13.78 19.83L12.33 20.02L11.67 20.02L10.45 19.88L9 19.45L7.78 18.84L7.73 18.75L7.36 18.56L7.27 18.42L7.17 18.42L7.08 18.28L6.98 18.28L6.84 18.09L6.75 18.09L5.48 16.73L5.48 16.64L5.11 16.17L5.02 15.89L4.92 15.84L4.64 15.28L4.59 15.05L4.69 15.05L5.11 15.38L6 15.8L7.08 16.12L8.06 16.27L9.14 16.27L9.94 16.17L10.92 15.94L11.72 15.66L12.09 15.47L12.33 15.23L12.47 14.91L12.47 14.53L12.33 14.2L11.81 13.73L11.81 13.64L11.58 13.45L11.58 13.36L11.3 12.98L11.16 12.42L11.16 11.48L13.17 11.11Z"
      />
      <defs>
        <linearGradient id="okuIconGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#302C2C" />
          <stop offset="1" stopColor="#191717" />
        </linearGradient>
      </defs>
    </svg>
  )
}
