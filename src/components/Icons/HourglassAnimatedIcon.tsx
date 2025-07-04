import { TimeIcon } from '@/components/Icons/TimeIcon'

export function HourglassAnimatedIcon() {
  return (
    <TimeIcon
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeOut',
        duration: 2,
        repeatDelay: 1,
      }}
    />
  )
}
