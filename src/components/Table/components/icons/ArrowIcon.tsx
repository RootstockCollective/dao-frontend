import { SVGProps } from 'react'

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  const color = 'var(--color-text-100)'
  const bgColor = 'var(--color-bg-80)'
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="16" height="16" rx="2" fill={color} />
      <path d="M8 13L8 3" stroke={bgColor} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12 7L8 3L4 7"
        stroke={bgColor}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
