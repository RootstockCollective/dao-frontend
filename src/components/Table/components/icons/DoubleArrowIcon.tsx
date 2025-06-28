import { SVGProps } from 'react'

export function DoubleArrowIcon(props: SVGProps<SVGSVGElement>) {
  const color = 'var(--color-text-100)'
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <g clipPath="url(#clip0_4653_1427)">
        <path d="M8 2V6" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10V14" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M4.5 12L8 15L11.5 12"
          stroke={color}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.5 4L8 1L11.5 4"
          stroke={color}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4653_1427">
          <rect width="16" height="16" fill={color} />
        </clipPath>
      </defs>
    </svg>
  )
}
