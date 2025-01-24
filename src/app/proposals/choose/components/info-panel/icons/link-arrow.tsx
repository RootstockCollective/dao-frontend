import { SVGProps } from 'react'

export function LinkArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 18L18 6M18 6H10M18 6V14"
        stroke="#E56B1A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
export default LinkArrow
