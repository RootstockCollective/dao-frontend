import { cn } from '@/lib/utils'
import { HTMLAttributes, useMemo } from 'react'
import { Color, defaultColors, getRandomColorWithLightness } from './utils'

export interface Segment {
  name: string // Label for the segment
  value: number // Numeric value for the segment
  color?: Color // Optional color for the segment
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  segments: Segment[] // Array of pizza chart segments
}

/**
 * PizzaChartDetails renders a list of segment details with color indicators.
 * If a color is not provided for a segment, it uses a default or random color.
 */
export function PizzaChartDetails({ segments, className }: Props) {
  // Memoize the color array to avoid recalculating on every render
  const colors = useMemo(
    //  first colors are taken from the default colors array, the rest are randomly generated
    () => segments.map(({ color }, i) => color ?? defaultColors[i] ?? getRandomColorWithLightness()),
    [segments],
  )
  return (
    <div
      className={cn('min-w-[208px] w-fit p-4 bg-text-80 rounded-sm', className)}
      style={{ boxShadow: '0px 8px 24px 0px rgba(23, 20, 18, 0.14)' }}
    >
      <ul className="space-y-2">
        {segments.map(({ name, value }, i) => (
          <li key={`${name}-${i}`}>
            <div className="flex w-full gap-2 items-center">
              {/* Color indicator circle */}
              <Circle color={colors[i]} />
              {/* Segment name */}
              <p className="font-rootstock-sans text-sm text-bg-100">{name}</p>
              {/* Segment value, right-aligned */}
              <p className="font-rootstock-sans text-lg text-bg-100 grow text-right">
                {value.toLocaleString('en-US')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Circle renders a small SVG circle with the given color.
 */
const Circle = ({ color }: { color: Color }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <circle cx="5" cy="5" r="5" fill={color} />
  </svg>
)
