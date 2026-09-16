import { type IconProps } from '@/components/Icons/types'

/**
 * Three squares stepping up to the right, as in the banner designs:
 * a muted one at the bottom, the primary orange in the middle and a light one on top.
 *
 * Squares are 10 units wide with a 3 unit gap, so the artwork scales from `width`/`height`.
 */
export function BannerDecorativeSquares({
  'aria-label': ariaLabel = 'Decorative Squares',
  width = 30,
  height = 30,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      aria-label={ariaLabel}
      {...props}
    >
      <rect x="0" y="26" width="10" height="10" fill="var(--color-v3-bg-accent-40)" />
      <rect x="13" y="13" width="10" height="10" fill="var(--color-v3-primary)" />
      <rect x="26" y="0" width="10" height="10" fill="var(--color-v3-text-80)" />
    </svg>
  )
}
