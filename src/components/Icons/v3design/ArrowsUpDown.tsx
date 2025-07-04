import { IconProps } from '../types'

export const ArrowsUpDown = ({ 'aria-label': ariaLabel = 'Arrows Up Down', size = 16 }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-label={ariaLabel}
    >
      <g clipPath="url(#clip0_594_699)">
        <path d="M8 2V6" stroke="#ACA39D" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10V14" stroke="#ACA39D" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M4.5 12L8 15L11.5 12"
          stroke="#ACA39D"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.5 4L8 1L11.5 4"
          stroke="#ACA39D"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_594_699">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
