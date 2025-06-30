import { type IconProps } from './types'
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from './constants'

interface ParachuteIconProps extends IconProps {
  useGradient?: boolean
}

export function ParachuteIcon({
  'aria-label': ariaLabel = 'Parachute Icon',
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  fill = color,
  useGradient = false,
  ...props
}: ParachuteIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      {...props}
    >
      {useGradient && (
        <defs>
          <linearGradient id="parachuteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDBDFF" />
            <stop offset="100%" stopColor="#FFAC4F" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M17.1268 8.90625C17.1268 7.01658 16.3762 5.20431 15.04 3.86811C13.7038 2.53192 11.8915 1.78125 10.0018 1.78125C8.11216 1.78125 6.29989 2.53192 4.9637 3.86811C3.6275 5.20431 2.87683 7.01658 2.87683 8.90625M17.1268 8.90625L2.87683 8.90625M17.1268 8.90625L12.3768 12.4686M2.87683 8.90625L7.62683 12.4686M10.0002 9.11615L10.0002 12.0849M7.03147 8.90625C7.03147 3.5625 10.0002 1.78125 10.0002 1.78125C10.0002 1.78125 12.969 3.5625 12.969 8.90625M7.62576 12.0848L12.3758 12.0848V16.8348H7.62576L7.62576 12.0848Z"
        stroke={useGradient ? 'url(#parachuteGradient)' : color}
        strokeWidth="0.95"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
