import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Span } from '../TypographyNew'
import { useProgressAnimation } from './hooks'
import { HourglassIcon, ProgressPatternIcon } from './icons'

const ANIMATION_DURATION = 5000
const FLIP_DURATION = 700
const SIZE_CLASSES = 'w-72 h-12'

export const ProgressButton = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const { progress, flip } = useProgressAnimation(ANIMATION_DURATION, FLIP_DURATION)

  const ratio = progress / 100
  const showPattern = ratio > 0

  useEffect(() => {
    if (showPattern && containerRef.current) {
      setWidth(containerRef.current.offsetWidth)
    }
  }, [showPattern])

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-sm content-center bg-[#25221E] border border-[#66605C]',
        SIZE_CLASSES,
      )}
    >
      {showPattern && (
        <div className={cn('absolute inset-y-0 left-0 overflow-hidden', SIZE_CLASSES)}>
          <motion.div
            ref={containerRef}
            className="absolute inset-y-0 w-full"
            initial={false}
            animate={{ x: ratio * (width + 48) - 106 }}
            transition={{ duration: 0 }}
          >
            <div className="absolute inset-y-0 left-[calc(-100%_+_10px)] w-full bg-[#66605C]" />
            <ProgressPatternIcon flip={flip} />
          </motion.div>
        </div>
      )}

      <div className="relative z-10 flex items-center space-x-1 justify-center">
        <HourglassIcon />
        <Span className="text-[#D4CFC4]" variant="body" bold>
          In progress
        </Span>
        <Span className="text-[#E4E1DA]" variant="body-s">
          - 2 mins average
        </Span>
      </div>
    </div>
  )
}
