// Checkerboard style generator
export const checkerboardStyle = (): React.CSSProperties => ({
  backgroundImage: `
      linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.04) 75%),
      linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.04) 75%)
    `,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0,10px 10px',
})

export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

export const MIN_SEGMENT_PERCENT = 0
