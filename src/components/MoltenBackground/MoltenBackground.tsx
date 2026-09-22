'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

/**
 * The bands are drawn from two pools. The warm one carries the piece — ember through
 * amber to cream — and a minority of cool stops keeps it from reading as a single hue.
 */
const WARM_STOPS = [
  '#140f0c',
  '#2a0f05',
  '#5a1a06',
  '#8c2a08',
  '#c4551c',
  '#f57a2b',
  '#fba746',
  '#f9c79e',
  '#ffefd8',
]
const COOL_STOPS = ['#4b5cf0', '#2e39a6', '#7a3b6e', '#8e97f7']

const BAND_COUNT = 10
/** Odds that any one stop comes from the cool pool instead of the warm one. */
const COOL_ODDS = 0.22
/** The bands are laid out from a fixed seed, so the artwork is identical for everyone. */
const SEED = 11
/** Drawn small and scaled up: the result is blurred anyway, and this keeps the loop cheap. */
const CANVAS_SIZE = 320
/** Side of the repeating noise tile laid over the bands. */
const GRAIN_TILE = 168
/** Tilt of the whole stack, in radians. */
const BAND_ANGLE = -0.11
/** Where the still frame lands when motion is off — far enough in for the bands to have spread. */
const STILL_AT = 4

interface Band {
  y: number
  thickness: number
  speed: number
  drift: number
  phase: number
  wobble: number
  stops: string[]
}

/** Linear congruential generator: same sequence every time, no dependency needed. */
const createRandom = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) % 2147483648
  return seed / 2147483648
}

const createBands = (height: number): Band[] => {
  const random = createRandom(SEED)

  return Array.from({ length: BAND_COUNT }, (_, index) => {
    const stopCount = 4 + Math.floor(random() * 2)
    const stops = Array.from({ length: stopCount }, () => {
      const pool = random() < COOL_ODDS ? COOL_STOPS : WARM_STOPS
      return pool[Math.floor(random() * pool.length)]
    })

    return {
      y: (index / BAND_COUNT) * height + random() * height * 0.03,
      thickness: height * (0.13 + random() * 0.16),
      speed: 0.5 + random() * 1.5,
      drift: (random() - 0.5) * height * 0.16,
      phase: random() * Math.PI * 2,
      wobble: 0.3 + random() * 0.55,
      stops,
    }
  })
}

/** A tile of monochrome noise, as a data URL, to lay over the bands. */
const createGrainTile = () => {
  const canvas = document.createElement('canvas')
  canvas.width = GRAIN_TILE
  canvas.height = GRAIN_TILE

  const context = canvas.getContext('2d')
  if (!context) return null

  const image = context.createImageData(GRAIN_TILE, GRAIN_TILE)
  for (let i = 0; i < image.data.length; i += 4) {
    const value = 110 + Math.random() * 145
    image.data[i] = value
    image.data[i + 1] = value
    image.data[i + 2] = value
    image.data[i + 3] = 255
  }
  context.putImageData(image, 0, 0)

  return canvas.toDataURL()
}

export interface MoltenBackgroundProps {
  className?: string
}

/**
 * The molten texture behind the intro modal: wide horizontal bands drifting across a
 * near-black base, blurred heavily, with fine grain over the top and a vignette that
 * darkens the edges so whatever sits in the middle stays readable.
 *
 * Purely decorative, and it respects `prefers-reduced-motion` by drawing a single
 * still frame instead of animating.
 */
export const MoltenBackground = ({ className }: MoltenBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const grainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grain = grainRef.current
    if (!grain) return

    const tile = createGrainTile()
    if (!tile) return

    grain.style.backgroundImage = `url(${tile})`
    grain.style.backgroundSize = `${GRAIN_TILE}px ${GRAIN_TILE}px`
    grain.style.backgroundRepeat = 'repeat'
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const { width, height } = canvas
    const bands = createBands(height)
    const startedAt = performance.now()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let frame = 0

    const draw = (now: number) => {
      const time = reduceMotion ? STILL_AT : (now - startedAt) / 1000

      context.setTransform(1, 0, 0, 1, 0, 0)
      context.fillStyle = '#140f0c'
      context.fillRect(0, 0, width, height)

      context.save()
      // Rotate about the centre so the bands run slightly off horizontal, and let the
      // whole stack breathe up and down.
      context.translate(width / 2, height / 2)
      context.rotate(BAND_ANGLE + Math.sin(time * 0.22) * 0.03)
      context.translate(-width / 2, -height / 2 + Math.sin(time * 0.17) * height * 0.04)
      // Bands add up where they overlap, which is what gives the hot centres.
      context.globalCompositeOperation = 'lighter'

      bands.forEach(band => {
        const y = band.y + Math.sin(time * band.wobble + band.phase) * band.drift
        const gradient = context.createLinearGradient(-width * 0.5, 0, width * 1.5, 0)
        // Sliding the stops along the gradient is what makes the colour travel sideways.
        const shift = (time * band.speed * 0.085) % 1

        for (let stop = 0; stop <= band.stops.length; stop++) {
          const position = (stop / band.stops.length + shift) % 1
          gradient.addColorStop(Math.min(1, Math.max(0, position)), band.stops[stop % band.stops.length])
        }

        context.globalAlpha = 0.46
        context.fillStyle = gradient
        // Overdrawn on both sides so a rotated band never leaves a corner bare.
        context.fillRect(-width * 0.5, y - band.thickness / 2, width * 2, band.thickness)
      })

      context.restore()
      context.globalCompositeOperation = 'source-over'
      context.globalAlpha = 1

      if (!reduceMotion) frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div aria-hidden="true" className={cn('absolute inset-0 overflow-hidden bg-molten-ink', className)}>
      {/* Oversized so the blur has room to fall off instead of fading at the edges. */}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="absolute -inset-[7%] block h-[114%] w-[114%] blur-[13px] saturate-[1.06] contrast-[1.06]"
      />
      <div ref={grainRef} className="absolute inset-0 opacity-[0.34] mix-blend-overlay" />
      {/* Warm bloom through the middle, then a vignette to hold the edges down. */}
      <div className="absolute inset-0 bg-[radial-gradient(58%_46%_at_50%_50%,rgba(255,214,168,0.18)_0%,rgba(255,214,168,0)_72%)]" />
      <div className="absolute inset-0 shadow-[inset_0_0_110px_44px_rgba(11,9,8,0.62)]" />
    </div>
  )
}
