import { motion } from 'framer-motion'
import { useInterval } from '../hooks'
import { HourglassIcon } from './HourglassIcon'

const FLIP_DURATION = 2000
export const AnimatedHourglassIcon = () => {
  const flip = useInterval(FLIP_DURATION)
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
