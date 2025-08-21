import { Milestones } from '../shared/types'
import { IconProps } from '@/components/Icons'
import { SharedGradient } from './icons/SharedGradient'

interface Props extends IconProps {
  milestone: Milestones
  hasGradient?: boolean
}

/**
 * Milestone icon component with gradient background and customizable digit display.
 * Renders a milestone marker shape with a character or number centered inside.
 * Used for proposal milestones and progress indicators.
 * @param digit - Character or number to display inside the milestone
 */
export function MilestoneIcon({ milestone, width = 24, height = 24, hasGradient, ...props }: Props) {
  const [symbol] = milestone // take first symbol

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M 8.29 0.508 C 11.394 0.624 13.85 2.501 14.682 3.223 C 14.883 3.396 14.988 3.651 14.988 3.916 L 14.988 15.088 C 14.988 15.353 15.095 15.607 15.26 15.815 C 15.555 16.188 15.987 16.845 15.987 17.502 L 15.987 19.502 C 15.987 20.054 15.539 20.502 14.987 20.502 L 0.987 20.502 C 0.47 20.502 0.044 20.109 -0.007 19.605 L -0.013 19.502 L -0.012 17.502 C -0.012 16.927 0.318 16.352 0.599 15.967 L 0.716 15.815 C 0.86 15.633 0.96 15.416 0.983 15.187 L 0.988 15.088 L 0.988 3.916 C 0.988 3.651 1.093 3.396 1.294 3.223 C 2.153 2.478 4.742 0.502 7.988 0.502 L 8.29 0.508 Z M 7.988 1.752 C 5.343 1.752 3.137 3.313 2.238 4.064 L 2.238 15.088 C 2.238 15.692 1.996 16.211 1.695 16.591 C 1.581 16.735 1.454 16.917 1.361 17.106 C 1.264 17.303 1.238 17.436 1.238 17.502 C 1.238 17.969 1.237 18.654 1.237 19.252 L 14.737 19.252 L 14.737 17.502 C 14.737 17.436 14.711 17.303 14.614 17.106 C 14.521 16.917 14.394 16.735 14.28 16.591 C 13.979 16.211 13.738 15.692 13.738 15.088 L 13.738 4.065 C 12.84 3.314 10.634 1.752 7.988 1.752 Z M 11.988 4.002 C 12.264 4.002 12.488 4.226 12.488 4.502 C 12.488 4.778 12.264 5.002 11.988 5.002 L 3.988 5.002 C 3.712 5.002 3.488 4.778 3.488 4.502 C 3.488 4.226 3.712 4.002 3.988 4.002 L 11.988 4.002 Z"
        fill={hasGradient ? 'url(#milestone2-gradient)' : '#9A948D'}
      />

      {/* Text element for the digit */}
      <text
        x="8"
        y="13"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="medium"
        fontFamily="Sora, sans-serif"
        fill={hasGradient ? 'url(#milestone2-gradient)' : '#9A948D'}
      >
        {symbol}
      </text>

      {hasGradient && <SharedGradient id="milestone2-gradient" />}
    </svg>
  )
}
