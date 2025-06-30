import { type IconProps } from '@/components/Icons'
import { DEFAULT_ICON_COLOR } from '@/components/Icons/constants'

export function BackersDecorativeSquares({
  'aria-label': ariaLabel = 'Backers Decorative Squares Icon',
  width = 50,
  height = 40,
  color = DEFAULT_ICON_COLOR,
  fill = color,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 30 40"
      fill="none"
      {...props}
    >
      <rect width="10" height="10" transform="matrix(0 1 1 0 10 10)" fill="#413B5B" />
      <rect width="10" height="10" transform="matrix(0 1 1 0 20 20)" fill="#413B5B" />
      <rect width="10" height="10" transform="matrix(0 1 1 0 0 30)" fill="#413B5B" />
      <rect width="10" height="10" transform="matrix(0 1 1 0 10 0)" fill="#E4E1DA" />
    </svg>
  )
}

export default BackersDecorativeSquares
