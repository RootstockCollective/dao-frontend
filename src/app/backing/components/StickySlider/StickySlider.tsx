import { cn } from '@/lib/utils'
import * as SliderPrimitive from '@radix-ui/react-slider'
import React from 'react'

interface StickySliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  step?: number
  className?: string
  ticks?: number[]
  thumbSize?: string
  ticksEdgesSize?: number
  stickyThreshold?: number
  onMouseLeave?: () => void
}

export const StickySlider: React.FC<StickySliderProps> = ({
  value,
  onValueChange,
  max = 100,
  step = 1,
  className = '',
  ticks = [0, 25, 50, 75, 100],
  thumbSize = '2rem', // Increased for mobile
  ticksEdgesSize = 8,
  stickyThreshold = 2,
  onMouseLeave,
}) => {
  // Regular value change (no snap during drag)
  const handleValueChange = (val: number[]) => {
    onValueChange(val)
  }

  // Snap on release only
  const handleValueCommit = (val: number[]) => {
    const nearest = ticks.reduce((prev, curr) =>
      Math.abs(curr - val[0]) < Math.abs(prev - val[0]) ? curr : prev,
    )
    if (Math.abs(nearest - val[0]) <= stickyThreshold) {
      onValueChange([nearest])
    } else {
      onValueChange(val)
    }
  }

  // Handle clicks/taps on the track to jump the thumb
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const rawValue = percentage * max
    const steppedValue = Math.round(rawValue / step) * step

    const nearest = ticks.reduce((prev, curr) =>
      Math.abs(curr - steppedValue) < Math.abs(prev - steppedValue) ? curr : prev,
    )
    if (Math.abs(nearest - steppedValue) <= stickyThreshold) {
      onValueChange([nearest])
    } else {
      onValueChange([steppedValue])
    }
  }

  return (
    <SliderPrimitive.Root
      value={value}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
      max={max}
      step={step}
      className={cn('relative flex h-10 items-center w-full', className)}
      data-testid="sliderRoot"
      style={{ touchAction: 'none' }} // Prevent scroll during touch drag
    >
      <div className="relative w-full h-10 flex items-center" data-testid="sliderContainer">
        {/* Track with clipped range */}
        <SliderPrimitive.Track
          className="relative h-[1px] grow rounded-full bg-v3-text-60"
          style={{ clipPath: 'inset(0 6px 0 6px)' }}
          data-testid="sliderTrack"
        >
          <SliderPrimitive.Range
            className="absolute h-full rounded-full bg-v3-rif-blue"
            data-testid="sliderRange"
          />
        </SliderPrimitive.Track>

        {/* Invisible overlay for tap-to-jump */}
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handleTrackClick}
          style={{ touchAction: 'none' }}
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => {
          const isEdge = i === 0 || i === ticks.length - 1
          const height = isEdge ? ticksEdgesSize : ticksEdgesSize / 2
          const top = -height / 2
          const factor = (tick / max - 0.5) * 12
          const left = `calc(${tick}% - ${factor}px)`
          const isActive = tick <= value[0]
          const tickColor = isActive ? 'bg-v3-rif-blue' : 'bg-v3-text-60'
          return (
            <span
              key={tick}
              className={cn('absolute w-px', tickColor)}
              style={{
                left,
                height: `${height}px`,
                top: `calc(50% + ${top}px)`,
              }}
              data-testid={`sliderTick${tick}`}
            />
          )
        })}

        {/* Thumb */}
        <SliderPrimitive.Thumb
          className="block rounded-full bg-v3-primary focus:outline-none focus-visible:outline-none"
          style={{
            width: thumbSize,
            height: thumbSize,
          }}
          data-testid="sliderThumb"
          onTouchEnd={onMouseLeave}
        />
      </div>
    </SliderPrimitive.Root>
  )
}
