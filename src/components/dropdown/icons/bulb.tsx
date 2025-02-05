import { SVGAttributes } from 'react'
import React from 'react'

export function BulbIcon(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg {...props} width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12.5" r="12" fill="white" />
      <g clipPath="url(#clip0_37_24937)">
        <path
          d="M11 14.8293V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V14.8293M12 7V7.5M7.5 12H7M8.75 8.75L8.44995 8.44995M15.25 8.75L15.5501 8.44995M17 12H16.5M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
          stroke="#1A1A1A"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_37_24937">
          <rect width="12" height="12" fill="white" transform="translate(6 6)" />
        </clipPath>
      </defs>
    </svg>
  )
}
