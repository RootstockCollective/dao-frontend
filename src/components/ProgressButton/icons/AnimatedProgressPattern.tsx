import { motion } from 'framer-motion'
import { useRef } from 'react'
import { ProgressPatternIcon } from './ProgressPatternIcon'

interface Props {
  progress: number
  flip: boolean
}

const PATTERN_OFFSET = 48
const PATTERN_ADJUSTMENT = 106

export const AnimatedProgressPattern = ({ progress, flip }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const ratio = progress / 100
  const width = containerRef.current?.offsetWidth || 0
  const showPattern = ratio > 0

  return (
    showPattern && (
      <motion.div
        ref={containerRef}
        className="absolute inset-y-0 w-full"
        initial={false}
        animate={{ x: ratio * (width + PATTERN_OFFSET) - PATTERN_ADJUSTMENT }}
        transition={{ duration: 0 }}
      >
        <div className="absolute inset-y-0 left-[calc(-100%_+_10px)] w-full bg-[#66605C]" />
        <ProgressPatternIcon flip={flip} />
      </motion.div>
    )
  )
}
