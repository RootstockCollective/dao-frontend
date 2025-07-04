import { type IconProps } from '@/components/Icons'
import { DEFAULT_ICON_COLOR } from '@/components/Icons/constants'

export function BuildersDecorativeSquares({
  'aria-label': ariaLabel = 'Builders Decorative Squares Icon',
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
      <rect x="30" y="10" width="10" height="10" transform="rotate(90 30 10)" fill="#A26140" />
      <rect x="10" y="20" width="10" height="10" transform="rotate(90 10 20)" fill="#A26140" />
      <rect x="20" y="30" width="10" height="10" transform="rotate(90 20 30)" fill="#A26140" />
      <rect x="30" width="10" height="10" transform="rotate(90 30 0)" fill="#E4E1DA" />
    </svg>
  )
}

export default BuildersDecorativeSquares
