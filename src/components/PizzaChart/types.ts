import { type CSSProperties } from 'react'

/**
 * CSS color
 */
export type Color = CSSProperties['color']

/**
 * Pizza slice
 */
export interface Segment {
  name: string // Label for the segment
  value: number // Numeric value for the segment
}
/**
 * Slice with required color
 */
export interface ColoredSegment extends Segment {
  color: Color
}
/**
 * Slice with optional color
 */
export interface OptionalColorSegment extends Segment {
  color?: Color // color is optional!
}
