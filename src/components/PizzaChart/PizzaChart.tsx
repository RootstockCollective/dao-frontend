import { HTMLAttributes, useMemo, memo } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { PizzaChartDetails } from './PizzaChartDetails'
import { cn } from '@/lib/utils'
import type { Color, ColoredSegment, OptionalColorSegment } from './types'

// Default colors for the first three segments of Pizza chart
const defaultColors: Color[] = ['#1BC47D', '#FF6688', '#DEFF1A']

interface Props extends HTMLAttributes<HTMLDivElement> {
  segments: OptionalColorSegment[]
  radius?: number
  startAngle?: number
  disabled?: boolean
}

/**
 * Renders a pie chart SVG from segment data
 */
export const PizzaChart = memo(function PizzaChart({
  segments,
  radius = 16,
  startAngle = -90,
  disabled = false,
  ...props
}: Props) {
  const slices = usePaintSlices(segments)
  // Calculates sum for normalization
  const total = useMemo(() => slices.reduce((sum, s) => sum + s.value, 0), [slices])
  let currentAngle = startAngle
  return (
    <div className={cn({ grayscale: disabled })} {...props}>
      <Popover.Root>
        <Popover.Trigger>
          {total <= 0 ? (
            /* Renders an empty (white) pizza chart when there is no data */
            <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
              <circle cx={radius} cy={radius} r={radius} fill="white" />
            </svg>
          ) : (
            <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
              {slices.map(({ value, color }, i) => {
                const angle = (value / total) * 360
                const startAngle = currentAngle
                const endAngle = currentAngle + angle
                const slice = pizzaSlice(radius, startAngle, endAngle)
                currentAngle = endAngle
                return <path key={i} d={slice} fill={color} />
              })}
            </svg>
          )}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content side="top" align="center" sideOffset={4}>
            <PizzaChartDetails segments={slices} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
})

// Processes segments: Assigns colors to each slice
function usePaintSlices(segments: OptionalColorSegment[]): ColoredSegment[] {
  return useMemo<ColoredSegment[]>(
    () =>
      segments
        // paint slices with random colors if colors were not provided
        .map(({ color, ...segment }, i) => {
          return { ...segment, color: color ?? defaultColors[i] ?? getRandomColorWithLightness() }
        }),
    [segments],
  )
}

// Returns SVG path for a pie chart sector
function pizzaSlice(size: number, startAngle: number, endAngle: number) {
  // full sector?
  const angleDelta = endAngle - startAngle
  if (angleDelta >= 359.999) {
    // allow micro error
    const r = size
    // "double arc": left half of the circle + right half
    return [
      `M ${size - r} ${size}`, // point at 180°
      `a ${r} ${r} 0 1 0 ${r * 2} 0`, // first 180° (sweep = 0…180)
      `a ${r} ${r} 0 1 0 ${-r * 2} 0`, // second 180° (sweep = 180…360)
      'Z',
    ].join(' ')
  }

  // regular sectors (< 360°)
  const start = polarToCartesian(size, size, size, endAngle)
  const end = polarToCartesian(size, size, size, startAngle)
  const largeArcFlag = angleDelta <= 180 ? '0' : '1'

  return [
    `M ${size} ${size}`,
    `L ${start.x} ${start.y}`,
    `A ${size} ${size} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

// Converts polar coordinates (angle, radius) to cartesian (x, y)
export function polarToCartesian(centerX: number, centerY: number, r: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180)
  return {
    x: centerX + r * Math.cos(angleInRadians),
    y: centerY + r * Math.sin(angleInRadians),
  }
}

/**
 * Returns a random HSL color string with the specified lightness (0-100).
 * Used for segments without a specified color and beyond the default colors.
 */
function getRandomColorWithLightness(lightness = 50): Color {
  const hue = Math.floor(Math.random() * 360)
  const saturation = Math.floor(60 + Math.random() * 40)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
