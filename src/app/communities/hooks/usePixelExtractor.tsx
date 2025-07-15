import { useRef, useCallback } from 'react'

interface ExtractionCoordinates {
  x: number
  y: number
  width: number
  height: number
}

interface ExtractionResult {
  data: string
  coordinates: ExtractionCoordinates
}

interface ConfigObject {
  coords: (width: number, height: number) => { x: number; y: number }
  size: number
  [key: string]: any // Allow additional properties
}

export interface ConfigResult extends ConfigObject, ExtractionResult {}

type ImageSource = HTMLImageElement | string

export const usePixelExtractor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())

  const loadImage = useCallback((source: ImageSource): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (source instanceof HTMLImageElement) {
        if (source.complete && source.naturalWidth > 0) {
          resolve(source)
        } else {
          source.onload = () => resolve(source)
          source.onerror = reject
        }
        return
      }

      if (typeof source === 'string') {
        if (imageCache.current.has(source)) {
          resolve(imageCache.current.get(source)!)
          return
        }

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          imageCache.current.set(source, img)
          resolve(img)
        }
        img.onerror = () => reject(new Error(`Failed to load image: ${source}`))
        img.src = source
        return
      }

      reject(new Error('Invalid image source'))
    })
  }, [])

  const extractPixels = useCallback(
    async (
      imageSource: ImageSource,
      x: number,
      y: number,
      width: number,
      height: number,
    ): Promise<ExtractionResult> => {
      const image = await loadImage(imageSource)

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas')
      }

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')!

      canvas.width = image.naturalWidth || image.width
      canvas.height = image.naturalHeight || image.height
      ctx.drawImage(image, 0, 0)

      const clampedX = Math.max(0, Math.min(x, canvas.width - width))
      const clampedY = Math.max(0, Math.min(y, canvas.height - height))
      const clampedWidth = Math.min(width, canvas.width - clampedX)
      const clampedHeight = Math.min(height, canvas.height - clampedY)

      const imageData = ctx.getImageData(clampedX, clampedY, clampedWidth, clampedHeight)

      const pieceCanvas = document.createElement('canvas')
      pieceCanvas.width = clampedWidth
      pieceCanvas.height = clampedHeight
      const pieceCtx = pieceCanvas.getContext('2d')!
      pieceCtx.putImageData(imageData, 0, 0)

      return {
        data: pieceCanvas.toDataURL(),
        coordinates: { x: clampedX, y: clampedY, width: clampedWidth, height: clampedHeight },
      }
    },
    [loadImage],
  )

  const extractPixelsByConfig = async (
    imageSource: string,
    config: ConfigObject[] = PIXEL_CONFIGS.topRightDiagonal,
  ): Promise<ConfigResult[]> => {
    const image = await loadImage(imageSource)
    const { naturalWidth: w, naturalHeight: h } = image

    // Process each extraction
    const results = config.map(async (configObj): Promise<ConfigResult> => {
      const coords = configObj.coords(w, h)

      const result = await extractPixels(image, coords.x, coords.y, configObj.size, configObj.size)
      return {
        ...configObj,
        ...result,
      }
    })

    return await Promise.all(results)
  }

  return { extractPixels, extractPixelsByConfig, loadImage }
}

interface PixelConfigs {
  [key: string]: ConfigObject[]
}

export const PIXEL_CONFIGS: PixelConfigs = {
  topRightDiagonal: [
    { coords: (w, h) => ({ x: w - 10, y: 0 }), className: 'absolute top-[10px] -right-[10px]', size: 10 },
    { coords: (w, h) => ({ x: w - 20, y: 10 }), className: 'absolute top-[20px] -right-[20px]', size: 10 },
    { coords: (w, h) => ({ x: w - 30, y: 0 }), className: 'absolute top-0 -right-[30px]', size: 10 },
    {
      coords: (w, h) => ({ x: w - 20, y: 10 }),
      className: 'absolute top-[10px] right-[0px] opacity-50',
      size: 10,
    },
  ],
}
