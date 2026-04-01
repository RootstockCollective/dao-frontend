import React from 'react'
import { IconProps } from '@/components/Icons'

interface Props extends IconProps {
  active?: boolean
}

export function Chevron({ active = true, size = 24, ...props }: Props) {
  const color = active ? 'var(--color-text-100)' : 'var(--color-bg-40)'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <g clipPath="url(#clip0_3718_83052)">
        <path
          d="M16 19L8 12L16 5"
          stroke={color}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3718_83052">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
