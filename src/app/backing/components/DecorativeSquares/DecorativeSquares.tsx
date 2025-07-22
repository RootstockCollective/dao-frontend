import { type IconProps } from '@/components/Icons/types'
import { DEFAULT_ICON_COLOR } from '@/components/Icons/constants'

export function DecorativeSquares({
  'aria-label': ariaLabel = 'Decorative Squares Icon',
  width = 50,
  height = 40,
  color = DEFAULT_ICON_COLOR,
  fill = color,
  ...props
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="50" height="40" />
      <g clipPath="url(#clip0_2219_1646)">
        <rect width="606" height="178" transform="translate(10 30)" fill={color} />
        <rect width="10" height="10" transform="matrix(-1 0 0 1 30 20)" fill={color} />
        <rect width="10" height="10" transform="matrix(-1 0 0 1 50 0)" fill={color} />
        <rect width="10" height="10" transform="matrix(-1 0 0 1 10 30)" fill="#25211E" />
        <rect width="10" height="10" transform="matrix(-1 0 0 1 20 10.5)" fill={color} />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_2219_1646"
          x1="808"
          y1="89"
          x2="-677.376"
          y2="89"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#442351" />
          <stop offset="0.269231" stopColor="#C0F7FF" />
          <stop offset="0.759615" stopColor="#E3FFEB" />
        </linearGradient>
        <clipPath id="clip0_2219_1646">
          <rect width="1440" height="1196" fill="white" transform="translate(-292 -290)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default DecorativeSquares
