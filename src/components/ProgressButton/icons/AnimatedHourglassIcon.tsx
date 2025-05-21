import { motion } from 'framer-motion'
import { HourglassIcon } from './HourglassIcon'
import { FC } from 'react'

export const AnimatedHourglassIcon: FC<{ flip: boolean }> = ({ flip }) => {
  return (
    <motion.div
      animate={{ rotate: flip ? 180 : 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ display: 'inline-block' }}
    >
      <HourglassIcon />
    </motion.div>
  )
}
