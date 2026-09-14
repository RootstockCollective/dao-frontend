import { type IconProps } from '@/components/Icons/types'

/**
 * Small staircase of squares used as a decorative accent on page banners.
 * The dimmed squares blend with the banner background, so only the top ones read clearly.
 */
export function BannerDecorativeSquares({
  'aria-label': ariaLabel = 'Decorative Squares',
  width = 30,
  height = 40,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 30 40"
      fill="none"
      aria-hidden="true"
      aria-label={ariaLabel}
      {...props}
    >
      <rect width="10" height="10" transform="matrix(0 1 1 0 10 0)" fill="#E4E1DA" />
      <rect width="10" height="10" transform="matrix(0 1 1 0 10 10)" fill="#E4E1DA" fillOpacity="0.6" />
      <rect width="10" height="10" transform="matrix(0 1 1 0 20 20)" fill="#E4E1DA" fillOpacity="0.25" />
      <rect width="10" height="10" transform="matrix(0 1 1 0 0 30)" fill="#E4E1DA" fillOpacity="0.15" />
    </svg>
  )
}
