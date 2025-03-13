import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR } from './constants'

export function QuestionIcon({
  'aria-label': ariaLabel = 'Question Icon',
  size = 20,
  color = DEFAULT_ICON_COLOR,
  fill = 'none',
  stroke = color,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill={fill}
      stroke={stroke}
      aria-label={ariaLabel}
      {...props}
    >
      <g clip-path="url(#clip0_187_21511)">
        <path
          d="M7.57484 7.49999C7.77076 6.94305 8.15746 6.47341 8.66647 6.17427C9.17547 5.87512 9.77392 5.76577 10.3558 5.86558C10.9377 5.96539 11.4655 6.26793 11.8457 6.7196C12.226 7.17127 12.4341 7.74293 12.4332 8.33332C12.4332 9.99999 9.93317 10.8333 9.93317 10.8333M9.99984 14.1667H10.0082M18.3332 9.99999C18.3332 14.6024 14.6022 18.3333 9.99984 18.3333C5.39746 18.3333 1.6665 14.6024 1.6665 9.99999C1.6665 5.39762 5.39746 1.66666 9.99984 1.66666C14.6022 1.66666 18.3332 5.39762 18.3332 9.99999Z"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_187_21511">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
