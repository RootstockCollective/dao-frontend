import { DEFAULT_ICON_COLOR } from '../constants'
import { type IconProps } from '../types'

export function RightArrowIcon({
  'aria-label': ariaLabel = 'Right Arrow Icon',
  size = 20,
  color = DEFAULT_ICON_COLOR,
  fill = color,
  stroke = color,
  strokeWidth = 0,
  ...props
}: IconProps & { stroke?: string; strokeWidth?: number }) {
  return (
    <svg
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      {...props}
    >
      <path
        d="M14.2326 10.4167H4.58366C4.35354 10.4167 4.16699 10.2301 4.16699 9.99999C4.16699 9.76987 4.35354 9.58332 4.58366 9.58332H14.2326L9.70304 5.05374C9.53904 4.88975 9.53958 4.62369 9.70424 4.46036C9.86796 4.29796 10.1322 4.29849 10.2952 4.46155L15.1266 9.29288C15.5171 9.68341 15.5171 10.3166 15.1266 10.7071L10.2952 15.5384C10.1322 15.7015 9.86796 15.702 9.70424 15.5396C9.53958 15.3763 9.53904 15.1102 9.70304 14.9462L14.2326 10.4167Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
