import type { Color } from '../colors'

type GradientColors = Color | [Color] | [Color, Color] | [Color, Color, Color]

/**
 * Renders an SVG linearGradient definition for 1-3 color gradient.
 */
export function GradientDef({ id, color }: { id: string; color: GradientColors }) {
  const renderStops = () => {
    if (Array.isArray(color)) {
      if (color.length === 1) {
        // Single color - solid color
        return (
          <>
            <stop offset="0%" stopColor={String(color[0])} />
            <stop offset="100%" stopColor={String(color[0])} />
          </>
        )
      } else if (color.length === 2) {
        // Two colors - linear gradient
        return (
          <>
            <stop offset="0%" stopColor={String(color[0])} />
            <stop offset="100%" stopColor={String(color[1])} />
          </>
        )
      } else if (color.length === 3) {
        // Three colors - three-stop gradient
        return (
          <>
            <stop offset="0%" stopColor={String(color[0])} />
            <stop offset="50%" stopColor={String(color[1])} />
            <stop offset="100%" stopColor={String(color[2])} />
          </>
        )
      }
    } else {
      // Single color - solid color
      return (
        <>
          <stop offset="0%" stopColor={String(color)} />
          <stop offset="100%" stopColor={String(color)} />
        </>
      )
    }
  }

  return <linearGradient id={id}>{renderStops()}</linearGradient>
}
