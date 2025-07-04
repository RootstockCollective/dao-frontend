import { IconProps } from '../types'

export const ArrowUpWFill = ({ 'aria-label': ariaLabel = 'Arrows Up Down', size = 16 }: IconProps) => {
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
