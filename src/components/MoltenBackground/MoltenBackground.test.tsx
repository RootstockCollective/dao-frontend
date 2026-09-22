import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { type Band, createBandGradient, createBands, drawGrain, MoltenBackground } from './MoltenBackground'

const CANVAS_WIDTH = 320

interface RecordedStop {
  offset: number
  color: string
}

interface RecordedGradient {
  x0: number
  x1: number
  stops: RecordedStop[]
}

/**
 * jsdom has no 2D context, so the drawing helpers are exercised against a recorder that
 * captures the calls they make. It only has to implement what they reach for.
 */
/** Everything the drawing loop touches on a 2D context, and nothing else. */
const stubContext = () => ({
  setTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillRect: vi.fn(),
  createLinearGradient: () => ({ addColorStop: vi.fn() }) as unknown as CanvasGradient,
  createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  putImageData: vi.fn(),
  createPattern: () => ({}) as CanvasPattern,
  globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
  globalAlpha: 1,
  fillStyle: '' as string | CanvasGradient | CanvasPattern,
})

const recordGradient = (band: Band, time: number): RecordedGradient => {
  const recorded: RecordedGradient = { x0: 0, x1: 0, stops: [] }

  const context = {
    createLinearGradient: (x0: number, _y0: number, x1: number) => {
      recorded.x0 = x0
      recorded.x1 = x1
      return {
        addColorStop: (offset: number, color: string) => recorded.stops.push({ offset, color }),
      } as unknown as CanvasGradient
    },
  }

  createBandGradient(context, band, CANVAS_WIDTH, time)

  return recorded
}

describe('createBands', () => {
  it('lays the bands out from a fixed seed, so every holder sees the same artwork', () => {
    expect(createBands(CANVAS_WIDTH)).toEqual(createBands(CANVAS_WIDTH))
  })

  it('gives every band colours to cycle through and a thickness that fits the canvas', () => {
    const bands = createBands(CANVAS_WIDTH)

    expect(bands.length).toBeGreaterThan(0)

    bands.forEach(band => {
      expect(band.stops.length).toBeGreaterThanOrEqual(4)
      expect(band.thickness).toBeGreaterThan(0)
      expect(band.thickness).toBeLessThan(CANVAS_WIDTH)
      expect(band.speed).toBeGreaterThan(0)
    })
  })
})

describe('createBandGradient', () => {
  const [band] = createBands(CANVAS_WIDTH)

  /*
   * The regression this guards: positions used to be wrapped with `% 1`, which put the
   * stop that crossed 1.0 back near 0 and dropped two unrelated colours side by side —
   * a hard edge sweeping across the band as it drifted.
   */
  it.each([0, 0.4, 1.7, 6.3, 19.8])('lays the stops out in order at t=%s', time => {
    const { stops } = recordGradient(band, time)

    expect(stops.length).toBeGreaterThan(band.stops.length)

    stops.forEach(({ offset }, index) => {
      expect(offset).toBeGreaterThanOrEqual(0)
      expect(offset).toBeLessThanOrEqual(1)
      if (index > 0) expect(offset).toBeGreaterThan(stops[index - 1].offset)
    })

    expect(stops[0].offset).toBe(0)
    expect(stops[stops.length - 1].offset).toBe(1)
  })

  it('repeats the same colours one canvas width apart, so the drift has no seam', () => {
    const { x0, x1, stops } = recordGradient(band, 3.2)
    const span = x1 - x0
    const cycle = band.stops.length

    stops.slice(0, stops.length - cycle).forEach((stop, index) => {
      const next = stops[index + cycle]

      expect(next.color).toBe(stop.color)
      expect((next.offset - stop.offset) * span).toBeCloseTo(CANVAS_WIDTH, 6)
    })
  })

  it('covers the whole overdrawn band at any point in the cycle', () => {
    // The band is filled from -0.5w to 1.5w; the gradient has to span at least that.
    for (const time of [0, 2.5, 5, 11, 17]) {
      const { x0, x1 } = recordGradient(band, time)

      expect(x0).toBeLessThanOrEqual(-CANVAS_WIDTH * 0.5)
      expect(x1).toBeGreaterThanOrEqual(CANVAS_WIDTH * 1.5)
    }
  })
})

describe('drawGrain', () => {
  /**
   * Real canvas elements with a stubbed context, rather than object literals: `drawGrain`
   * reaches for `document.createElement('canvas')` itself, and the data-URL check below is
   * only worth anything if the canvases actually carry `toDataURL` on their prototype.
   */
  const captureNoise = () => {
    const written: Uint8ClampedArray[] = []

    const context = {
      createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: (image: { data: Uint8ClampedArray }) => written.push(image.data.slice()),
      createPattern: () => ({}) as CanvasPattern,
      fillRect: vi.fn(),
      fillStyle: '',
    }

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )

    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512

    return { canvas, context, written }
  }

  /** The red channel of every pixel in the tile. The noise is monochrome, so one is enough. */
  const redChannel = (data: Uint8ClampedArray) => data.filter((_, index) => index % 4 === 0)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('paints a tiled field of noise across the whole canvas', () => {
    const { canvas, context, written } = captureNoise()

    expect(drawGrain(canvas)).toBe(true)
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 512, 512)
    expect(written).toHaveLength(1)

    const values = redChannel(written[0])
    expect(new Set(values).size).toBeGreaterThan(50)
  })

  it('produces the same noise every time, like the bands under it', () => {
    const first = captureNoise()
    drawGrain(first.canvas)
    vi.restoreAllMocks()

    const second = captureNoise()
    drawGrain(second.canvas)

    expect(Array.from(first.written[0])).toEqual(Array.from(second.written[0]))
  })

  /*
   * The tile used to be encoded to a PNG data URL and handed back as a CSS background.
   * Noise does not compress, so that was a ~100KB string to encode and then decode again
   * on the main thread, every time the modal opened.
   */
  it('never serialises the tile to a data URL', () => {
    const { canvas, context } = captureNoise()
    const toDataURL = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:,')

    expect(drawGrain(canvas)).toBe(true)
    expect(context.fillRect).toHaveBeenCalled()
    expect(toDataURL).not.toHaveBeenCalled()
  })
})

/**
 * A clock the test drives by hand, so the throttle and the settle can be measured instead
 * of waited out. Every scheduled frame due at the new time fires on each tick.
 */
const takeOverAnimationFrames = () => {
  const callbacks = new Map<number, FrameRequestCallback>()
  let now = 0
  let nextId = 1

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    const id = nextId++
    callbacks.set(id, callback)
    return id
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {
    callbacks.delete(id)
  })
  vi.spyOn(performance, 'now').mockImplementation(() => now)

  return {
    pending: () => callbacks.size,
    tick: (ms: number) => {
      now += ms
      const due = [...callbacks.values()]
      callbacks.clear()
      due.forEach(callback => callback(now))
    },
  }
}

describe('MoltenBackground', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders without a 2D context rather than throwing', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

    const { container } = render(<MoltenBackground />)

    expect(container.querySelectorAll('canvas')).toHaveLength(2)
    // Purely decorative: nothing here should reach the accessibility tree.
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws a single still frame and starts no loop under prefers-reduced-motion', () => {
    const context = stubContext()

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList)

    const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame')

    render(<MoltenBackground />)

    expect(requestAnimationFrame).not.toHaveBeenCalled()
    // The base fill plus one rect per band: the still frame was drawn anyway.
    expect(context.fillRect.mock.calls.length).toBeGreaterThan(1)
  })

  /*
   * The canvas carries a CSS blur, so each frame repaints a filtered layer. Redrawing on
   * every display frame is what made this expensive in the first place.
   */
  it('redraws at about half the rate of a 60Hz display', () => {
    const context = stubContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )
    const clock = takeOverAnimationFrames()

    render(<MoltenBackground />)

    const ticks = 60
    for (let tick = 0; tick < ticks; tick++) clock.tick(1000 / 60)

    // One setTransform per frame actually drawn.
    const drawn = context.setTransform.mock.calls.length
    expect(drawn).toBeGreaterThan(20)
    expect(drawn).toBeLessThan(40)
    expect(drawn).toBeLessThan(ticks * 0.75)
  })

  it('settles into a still frame rather than looping forever', () => {
    const context = stubContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )
    const clock = takeOverAnimationFrames()

    render(<MoltenBackground />)

    for (let second = 0; second < 19; second++) clock.tick(1000)
    expect(clock.pending()).toBe(1)

    // Past the settle point the loop lets go, and nothing further is drawn.
    clock.tick(1000)
    clock.tick(1000)
    expect(clock.pending()).toBe(0)

    const drawn = context.setTransform.mock.calls.length
    clock.tick(1000)
    expect(context.setTransform.mock.calls.length).toBe(drawn)
  })

  it('cancels its frame on unmount', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      stubContext() as unknown as CanvasRenderingContext2D,
    )
    const clock = takeOverAnimationFrames()

    const { unmount } = render(<MoltenBackground />)
    clock.tick(1000 / 60)
    expect(clock.pending()).toBe(1)

    unmount()
    expect(clock.pending()).toBe(0)
  })

  it('follows the motion setting if it changes while the modal is open', () => {
    const listeners: Array<() => void> = []
    const query = {
      matches: false,
      addEventListener: (_: string, listener: () => void) => listeners.push(listener),
      removeEventListener: vi.fn(),
    }

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      stubContext() as unknown as CanvasRenderingContext2D,
    )
    vi.spyOn(window, 'matchMedia').mockReturnValue(query as unknown as MediaQueryList)

    const requestAnimationFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockReturnValue(1 as unknown as number)
    const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame')

    const { unmount } = render(<MoltenBackground />)

    expect(listeners).toHaveLength(1)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)

    // The holder turns motion off: the loop stops rather than running to the end of time.
    query.matches = true
    listeners[0]()

    expect(cancelAnimationFrame).toHaveBeenCalledWith(1)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)

    unmount()

    expect(query.removeEventListener).toHaveBeenCalled()
  })
})
