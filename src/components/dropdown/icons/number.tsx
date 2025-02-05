import { SVGAttributes } from 'react'

interface Props extends SVGAttributes<SVGSVGElement> {
  number: string
}

export const NumberIcon = ({ number, width = 24, height = 24, ...props }: Props) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12.5" r="12" fill="white" />
      {/* Number inside the circle */}
      <text
        x="12"
        y="14"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontFamily="kk-topo"
        fill="black"
      >
        {number}
      </text>
    </svg>
  )
}
