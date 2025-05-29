export type Color = `#${string}`

// these colors are used in Motion animations and thus cannot be taken from the CSS theme
const bg = '#25211E'
const blue = '#4B5CF0'
const orange = '#F47A2A'
const gray = '#66605C'

// color combinations for progress bar components
export const progressBarColors = {
  blue: [bg, blue],
  gray: [bg, gray],
  gradient: [bg, [blue, orange]],
} satisfies Record<string, (Color | [Color, Color])[]>
