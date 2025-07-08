import { TimeIcon, TimeIconProps } from '@/components/Icons/TimeIcon'

export function HourglassAnimatedIcon(props: TimeIconProps) {
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
      {...props}
    />
  )
}
