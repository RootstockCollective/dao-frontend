import { DEFAULT_ICON_COLOR, DEFAULT_ICON_FILL, DEFAULT_ICON_SIZE } from '../constants'
import { IconProps } from '../types'

export const TrashIcon = ({
  'aria-label': ariaLabel = 'Trash',
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  fill = DEFAULT_ICON_FILL,
  stroke = color,
  strokeWidth = 1.25,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
      fill="none"
      aria-label={ariaLabel}
      {...props}
    >
      <path
        d="M6.34633 16.6664C5.97341 16.6664 5.65578 16.5353 5.39341 16.2731C5.13119 16.0107 5.00008 15.6931 5.00008 15.3202V4.99977H4.16675V4.16643H7.50008V3.52539H12.5001V4.16643H15.8334V4.99977H15.0001V15.3202C15.0001 15.7038 14.8716 16.0241 14.6147 16.281C14.3577 16.538 14.0374 16.6664 13.6538 16.6664H6.34633ZM14.1667 4.99977H5.83341V15.3202C5.83341 15.4698 5.88147 15.5927 5.97758 15.6889C6.07383 15.785 6.19675 15.8331 6.34633 15.8331H13.6538C13.7822 15.8331 13.8997 15.7797 14.0065 15.6729C14.1133 15.5661 14.1667 15.4485 14.1667 15.3202V4.99977ZM8.17321 14.1664H9.00654V6.66643H8.17321V14.1664ZM10.9936 14.1664H11.827V6.66643H10.9936V14.1664Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    </svg>
  )
}
