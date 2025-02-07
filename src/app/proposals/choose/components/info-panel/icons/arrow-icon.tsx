import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

/**
 * Arrow that visually completes a link.
 * To prevent it from breaking onto a new line, ensure a non-breaking space (`&nbsp;`)
 * is placed before it.
 */
export function ArrowIcon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    // Wrapping SVG in <span> to apply `whitespace-nowrap`
    // This ensures the arrow doesn't break onto a new line
    <span {...props} className={cn(className, 'whitespace-nowrap')}>
      {' '}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="inline -translate-x-1"
      >
        <path
          d="M6 18L18 6M18 6H10M18 6V14"
          stroke="#E56B1A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
export default ArrowIcon
