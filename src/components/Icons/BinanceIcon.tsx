import { DEFAULT_ICON_SIZE } from './constants'
import { type IconProps } from './types'

/**
 * Binance brand mark, drawn as the circular badge Binance uses for its own app icon
 * (Binance Yellow on black).
 *
 * This is a third-party trademark used only to identify the service being linked to, so the
 * brand colours are fixed: unlike the monochrome icons in this folder it deliberately ignores
 * `color` / `fill` / `stroke` (they are pinned after the prop spread). Only `size`, `className`
 * and the remaining SVG props have an effect.
 */
export function BinanceIcon({
  'aria-label': ariaLabel = 'Binance Icon',
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
      <circle cx="12" cy="12" r="12" fill="#000000" />
      <path
        d="M7.6159 12L5.81135 13.8045L4.00226 12L5.80681 10.1955L7.6159 12ZM12.0023 7.61364L15.0977 10.7091L16.9023 8.90455L12.0023 4L7.09772 8.90455L8.90226 10.7091L12.0023 7.61364ZM18.1932 10.1955L16.3886 12L18.1932 13.8045L19.9977 12L18.1932 10.1955ZM12.0023 16.3864L8.90681 13.2909L7.10226 15.0955L12.0023 20L16.9023 15.0955L15.0977 13.2909L12.0023 16.3864ZM12.0023 13.8045L13.8068 12L12.0023 10.1955L10.1932 12L12.0023 13.8045Z"
        fill="#F0B90B"
      />
    </svg>
  )
}
