import React from 'react'
import { IconProps } from '@/components/Icons/types'
import { SharedGradient } from './SharedGradient'

interface HammerIconProps extends IconProps {
  hasGradient?: boolean
}

export function HammerIcon({ width = 24, height = 24, hasGradient = false, ...props }: HammerIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      {hasGradient && <SharedGradient id="hammer-gradient" />}
      <path
        d="M10.125 10.875L13.125 13.875"
        stroke={hasGradient ? 'url(#hammer-gradient)' : '#ACA39D'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75012 5.99964L5.04106 4.66558C5.80716 3.89937 6.71669 3.29157 7.7177 2.87689C8.71872 2.46221 9.79161 2.24878 10.8751 2.24878C11.9586 2.24878 13.0315 2.46221 14.0325 2.87689C15.0336 3.29157 15.9431 3.89937 16.7092 4.66558L22.6558 10.6553C22.7963 10.7959 22.8752 10.9866 22.8752 11.1854C22.8752 11.3843 22.7963 11.5749 22.6558 11.7156L19.9689 14.4053C19.8282 14.5458 19.6375 14.6248 19.4387 14.6248C19.2399 14.6248 19.0492 14.5458 18.9086 14.4053L15.7501 11.2496L6.2195 20.7803C6.07886 20.9208 5.88817 20.9998 5.68934 20.9998C5.49051 20.9998 5.29982 20.9208 5.15918 20.7803L3.2195 18.8434C3.07895 18.7028 3 18.5121 3 18.3132C3 18.1144 3.07895 17.9237 3.2195 17.7831L12.7501 8.24964L7.4795 2.97902"
        stroke={hasGradient ? 'url(#hammer-gradient)' : '#ACA39D'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.445 8.43042L16.6875 12.1879"
        stroke={hasGradient ? 'url(#hammer-gradient)' : '#ACA39D'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
