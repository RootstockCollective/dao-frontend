import React from 'react'
import { type SVGProps } from 'react'

export interface CloseButtonIconProps extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  color?: 'white' | 'black'
  size?: number | string
}

const COLOR_MAP = {
  white: 'white',
  black: '#171412',
}

export function CloseButtonIcon({ color = 'white', size = 24, ...props }: CloseButtonIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Close Button Icon"
      {...props}
    >
      <path
        d="M19 5L5 19M5 5L19 19"
        stroke={COLOR_MAP[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
