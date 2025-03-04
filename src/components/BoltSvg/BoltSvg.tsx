import { FC, SVGProps } from 'react'

export type BoltSvgProps = SVGProps<SVGSVGElement> & {
  showGlow?: boolean
}
export const BoltSvg: FC<BoltSvgProps> = ({ showGlow, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...rest}>
    <g filter={showGlow ? 'url(#filter0_d_671_52312)' : ''}>
      <path
        d="M13.0008 2L4.09429 12.6879C3.74549 13.1064 3.57108 13.3157 3.56842 13.4925C3.5661 13.6461 3.63457 13.7923 3.7541 13.8889C3.89159 14 4.16402 14 4.70887 14H12.0008L11.0008 22L19.9074 11.3121C20.2562 10.8936 20.4306 10.6843 20.4333 10.5075C20.4356 10.3539 20.3671 10.2077 20.2476 10.1111C20.1101 10 19.8377 10 19.2928 10H12.0008L13.0008 2Z"
        fill="black"
      />
      <path
        d="M13.0008 2L4.09429 12.6879C3.74549 13.1064 3.57108 13.3157 3.56842 13.4925C3.5661 13.6461 3.63457 13.7923 3.7541 13.8889C3.89159 14 4.16402 14 4.70887 14H12.0008L11.0008 22L19.9074 11.3121C20.2562 10.8936 20.4306 10.6843 20.4333 10.5075C20.4356 10.3539 20.3671 10.2077 20.2476 10.1111C20.1101 10 19.8377 10 19.2928 10H12.0008L13.0008 2Z"
        fill="url(#paint0_linear_671_33537)"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_671_52312"
        x="-3.1"
        y="-1.1"
        width="40.2"
        height="40.2"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset />
        <feGaussianBlur stdDeviation="4.05" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.751888 0 0 0 0 0.967986 0 0 0 0 1 0 0 0 0.65 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_671_52312" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_671_52312" result="shape" />
      </filter>
      <linearGradient
        id="paint0_linear_671_33537"
        x1="97.5"
        y1="12"
        x2="-28.5"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4B171A" />
        <stop offset="0.35" stopColor="#C0F7FF" />
        <stop offset="0.76" stopColor="#E3FFEB" />
      </linearGradient>
    </defs>
  </svg>
)
