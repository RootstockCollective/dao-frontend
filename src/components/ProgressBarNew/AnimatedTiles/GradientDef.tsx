import type { Color } from '../colors'

/**
 * Renders an SVG linearGradient definition for single or dual color gradient.
 */
export function GradientDef({ id, color }: { id: string; color: Color | [Color, Color] }) {
  return (
    <linearGradient id={id}>
      {Array.isArray(color) ? (
        <>
          <stop offset="0%" stopColor={String(color[0])} />
          <stop offset="100%" stopColor={String(color[1])} />
        </>
      ) : (
        <>
          <stop offset="0%" stopColor={String(color)} />
          <stop offset="100%" stopColor={String(color)} />
        </>
      )}
    </linearGradient>
  )
}
