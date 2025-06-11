import { type CSSProperties } from 'react'

export type Color = CSSProperties['color']

/**
 * Returns a random HSL color string with the specified lightness (0-100).
 * Used for segments without a specified color and beyond the default colors.
 */
export function getRandomColorWithLightness(lightness = 50): Color {
  const hue = Math.floor(Math.random() * 360)
  const saturation = Math.floor(60 + Math.random() * 40)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Default colors for the first three segments
export const defaultColors: Color[] = ['#1BC47D', '#FF6688', '#DEFF1A']
