import { IconProps } from '../types'

export const ArrowDownWFill = ({ 'aria-label': ariaLabel = 'Arrows Up Down', size = 16 }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-label={ariaLabel}
    >
      <rect width="16" height="16" rx="2" fill="#ACA39D" />
      <path d="M8 3V13" stroke="#171412" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4 9L8 13L12 9"
        stroke="#171412"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
