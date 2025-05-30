import React from 'react'

interface CaretRightProps {
  className?: string
}

export const CaretRight: React.FC<CaretRightProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_2481_2573)">
        <path
          d="M6 12.5714L11 7.57141L6 2.57141"
          stroke="#ACA39D"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2481_2573">
          <rect width="16" height="16" fill="white" transform="matrix(-1 8.74228e-08 8.74228e-08 1 16 0)" />
        </clipPath>
      </defs>
    </svg>
  )
}
