import { ClassNameValue } from 'tailwind-merge'
import Big from '@/lib/big'

export type TimeSource = 'blocks' | 'timestamp'

/**
 * Props for the Countdown component
 *
 * @param end - The end time/block when the countdown should reach zero
 * @param timeSource - Whether the time is measured in blocks or timestamps
 * @param referenceStart - Optional reference point for ratio calculation (used for color coding)
 *   - For blocks: represents the starting block number
 *   - For timestamps: represents the starting timestamp
 *   - If not provided, color coding will be automatically disabled
 * @param className - Optional CSS classes
 * @param colorDirection - Color progression direction (only applies when referenceStart is provided)
 *   - 'normal': green (lots of time) → yellow → red (little time)
 *   - 'reversed': red (lots of time) → yellow → green (little time)
 */
export interface CountdownProps {
  end: Big
  timeSource: TimeSource
  referenceStart?: Big
  className?: ClassNameValue
  colorDirection?: 'normal' | 'reversed'
}
