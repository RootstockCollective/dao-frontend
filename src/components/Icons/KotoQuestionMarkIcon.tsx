import * as React from 'react'

const SVGComponent = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M8 11V10.1111C10.2093 10.1111 12 8.51926 12 6.55556C12 4.59185 10.2093 3 8 3C5.79071 3 4 4.59185 4 6.55556"
      stroke="white"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 15C8.55228 15 9 14.5523 9 14C9 13.4477 8.55228 13 8 13C7.44772 13 7 13.4477 7 14C7 14.5523 7.44772 15 8 15Z"
      fill="white"
    />
  </svg>
)
export default SVGComponent
