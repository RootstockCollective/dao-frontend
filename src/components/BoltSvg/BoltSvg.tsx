import { FC, SVGProps } from 'react'

export type BoltSvgProps = SVGProps<SVGSVGElement> & {
  showGlow?: boolean
}
export const BoltSvg: FC<BoltSvgProps> = ({ showGlow, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...rest}>
    <g filter={showGlow ? 'url(#filter0_d_671_52312)' : ''}>
      <path
        d="M18.0008 9L9.09429 19.6879C8.74549 20.1064 8.57108 20.3157 8.56842 20.4925C8.5661 20.6461 8.63457 20.7923 8.7541 20.8889C8.89159 21 9.16402 21 9.70887 21H17.0008L16.0008 29L24.9074 18.3121C25.2562 17.8936 25.4306 17.6843 25.4333 17.5075C25.4356 17.3539 25.3671 17.2077 25.2476 17.1111C25.1101 17 24.8377 17 24.2928 17H17.0008L18.0008 9Z"
        fill="black"
      />
      <path
        d="M18.0008 9L9.09429 19.6879C8.74549 20.1064 8.57108 20.3157 8.56842 20.4925C8.5661 20.6461 8.63457 20.7923 8.7541 20.8889C8.89159 21 9.16402 21 9.70887 21H17.0008L16.0008 29L24.9074 18.3121C25.2562 17.8936 25.4306 17.6843 25.4333 17.5075C25.4356 17.3539 25.3671 17.2077 25.2476 17.1111C25.1101 17 24.8377 17 24.2928 17H17.0008L18.0008 9Z"
        fill="url(#paint0_linear_671_52312)"
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
