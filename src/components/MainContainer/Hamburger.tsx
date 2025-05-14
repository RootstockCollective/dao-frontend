import { HTMLAttributes } from 'react'
import { motion, type SVGMotionProps } from 'motion/react'
import { cn } from '@/lib/utils'

interface HamburgerProps extends HTMLAttributes<HTMLSpanElement> {
  isOpen: boolean
  toggle: () => void
  strokeWidth?: number
}

/**
 * A responsive hamburger menu button component that animates between open and closed states.
 * Displays three lines that transform into an "X" when open, commonly used for toggling navigation menus.
 */
export function Hamburger({
  strokeWidth = 1.25,
  color = '#fff',
  toggle,
  isOpen,
  className,
  ...props
}: HamburgerProps) {
  return (
    <span className={cn('inline-flex', className)} {...props}>
      <button onClick={toggle}>
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          animate={isOpen ? 'open' : 'closed'}
          initial={false}
        >
          <Path
            variants={{
              closed: { d: 'M 4 6.625 L 20 6.625' },
              open: { d: 'M 5 5 L 19 19' },
            }}
            strokeWidth={strokeWidth}
            color={color}
          />
          <Path
            d="M 4 11.625 L 20 11.625"
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 },
            }}
            transition={{ duration: 0.1 }} // middle line disappears quickly
            strokeWidth={strokeWidth}
            color={color}
          />
          <Path
            variants={{
              closed: { d: 'M 4 16.625 L 20 16.625' },
              open: { d: 'M 5 19 L 19 5' },
            }}
            strokeWidth={strokeWidth}
            color={color}
          />
        </motion.svg>
      </button>
    </span>
  )
}

const Path = ({
  color,
  stroke = color ?? '#fff',
  fill = 'transparent',
  strokeWidth = 1,
  strokeLinecap = 'round',
  ...props
}: SVGMotionProps<SVGPathElement>) => (
  <motion.path
    fill={fill}
    color={color}
    strokeWidth={strokeWidth}
    stroke={stroke}
    strokeLinecap={strokeLinecap}
    {...props}
  />
)
