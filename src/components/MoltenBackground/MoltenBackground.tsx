'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

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
/** The grain gets its own seed, so it is as reproducible as the bands underneath it. */
const GRAIN_SEED = 7
/** Drawn small and scaled up: the result is blurred anyway, and this keeps the loop cheap. */
const CANVAS_SIZE = 320
/** Side of the noise tile that gets repeated across the grain layer. */
const GRAIN_TILE = 168
/**
 * Side of the square layer the tile is repeated into. The panel is never exactly this
 * wide, so the browser resamples it — which is fine: the panel is square, so the scale
 * is uniform, and the grain sits at a third opacity in overlay over an already blurred
 * canvas. Drawn a little larger than the panel ever gets so it is only ever downscaled.
 */
const GRAIN_SIZE = 512
/** Tilt of the whole stack, in radians. */
const BAND_ANGLE = -0.11
/** Where the still frame lands when motion is off — far enough in for the bands to have spread. */
const STILL_AT = 4
/**
 * The canvas carries a CSS blur, so every frame repaints a filtered layer — the expensive
 * half of this component. The artwork is decorative and heavily blurred, so it is capped
 * well under the display refresh rate; the drift stays smooth at this rate.
 */
const FRAME_MS = 1000 / 30
/**
 * The bands settle into a still frame after this many seconds. Nobody keeps watching the
 * wallpaper of a modal they have had open for half a minute, and an unbounded loop costs
 * battery for nothing.
 */
const SETTLE_AFTER = 20

export interface Band {
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

export const createBands = (height: number): Band[] => {
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

export const drawGrain = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d')
  if (!context) return false

  const tile = document.createElement('canvas')
  tile.width = GRAIN_TILE
  tile.height = GRAIN_TILE

  const tileContext = tile.getContext('2d')
  if (!tileContext) return false

  const random = createRandom(GRAIN_SEED)
  const image = tileContext.createImageData(GRAIN_TILE, GRAIN_TILE)
  for (let i = 0; i < image.data.length; i += 4) {
    const value = 110 + random() * 145
    image.data[i] = value
    image.data[i + 1] = value
    image.data[i + 2] = value
    image.data[i + 3] = 255
  }
  tileContext.putImageData(image, 0, 0)

  const pattern = context.createPattern(tile, 'repeat')
  if (!pattern) return false

  context.fillStyle = pattern
  context.fillRect(0, 0, canvas.width, canvas.height)

  return true
}

export const createBandGradient = (
  context: Pick<CanvasRenderingContext2D, 'createLinearGradient'>,
  band: Band,
  width: number,
  time: number,
) => {
  const cycle = width
  const shift = (time * band.speed * 0.085) % 1
  // The fill runs from -0.5w to 1.5w; one spare cycle keeps it covered at any shift.
  const total = width * 3
  const start = -width * 0.5 - shift * cycle

  const gradient = context.createLinearGradient(start, 0, start + total, 0)
  const steps = (total / cycle) * band.stops.length

  for (let step = 0; step <= steps; step++) {
    gradient.addColorStop(step / steps, band.stops[step % band.stops.length])
  }

  return gradient
}

export interface MoltenBackgroundProps {
  className?: string
}

export const MoltenBackground = ({ className }: MoltenBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const grainRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const grain = grainRef.current
    if (grain) drawGrain(grain)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const { width, height } = canvas
    const bands = createBands(height)
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    let frame = 0
    let startedAt = 0
    /** Null until the first frame, so it draws straight away whatever the clock's origin. */
    let lastDrawnAt: number | null = null

    const drawFrame = (time: number) => {
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.globalCompositeOperation = 'source-over'
      context.globalAlpha = 1
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
      context.globalAlpha = 0.46

      bands.forEach(band => {
        const y = band.y + Math.sin(time * band.wobble + band.phase) * band.drift
        context.fillStyle = createBandGradient(context, band, width, time)
        // Overdrawn on both sides so a rotated band never leaves a corner bare.
        context.fillRect(-width * 0.5, y - band.thickness / 2, width * 2, band.thickness)
      })

      context.restore()
    }

    const stop = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)

      if (lastDrawnAt !== null && now - lastDrawnAt < FRAME_MS) return
      lastDrawnAt = lastDrawnAt === null ? now : now - ((now - lastDrawnAt) % FRAME_MS)

      const elapsed = (now - startedAt) / 1000
      drawFrame(Math.min(elapsed, SETTLE_AFTER))

      if (elapsed >= SETTLE_AFTER) stop()
    }

    const start = () => {
      stop()

      if (motionQuery?.matches) {
        drawFrame(STILL_AT)
        return
      }

      startedAt = performance.now()
      lastDrawnAt = null
      frame = requestAnimationFrame(loop)
    }

    start()
    motionQuery?.addEventListener?.('change', start)

    return () => {
      stop()
      motionQuery?.removeEventListener?.('change', start)
    }
  }, [])

  return (
    <div aria-hidden="true" className={cn('absolute inset-0 overflow-hidden bg-molten-ink', className)}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="absolute -inset-[7%] block h-[114%] w-[114%] blur-[13px] saturate-[1.06] contrast-[1.06]"
      />
      <canvas
        ref={grainRef}
        width={GRAIN_SIZE}
        height={GRAIN_SIZE}
        className="absolute inset-0 block h-full w-full opacity-[0.34] mix-blend-overlay"
      />
      <div className="absolute inset-0 bg-[radial-gradient(58%_46%_at_50%_50%,rgba(255,214,168,0.18)_0%,rgba(255,214,168,0)_72%)]" />
      <div className="absolute inset-0 shadow-[inset_0_0_110px_44px_rgba(11,9,8,0.62)]" />
    </div>
  )
}
