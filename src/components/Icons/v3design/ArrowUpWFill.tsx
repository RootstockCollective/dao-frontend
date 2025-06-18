import { DEFAULT_ICON_COLOR } from '../constants'
import { IconProps } from '../types'

const DEFAULT_RECT_FILL = '#ACA39D'
const DEFAULT_RECT_STROKE = '#ACA39D'

// FIXME: This icon is not working as expected.

export const ArrowUpWFill = ({
  'aria-label': ariaLabel = 'Arrows Up Down',
  size = 16,
  color = DEFAULT_ICON_COLOR,
  ...props
}: IconProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect width="16" height="16" rx="2" fill="#ACA39D" />
      <path d="M8 13L8 3" stroke="#171412" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12 7L8 3L4 7"
        stroke="#171412"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
