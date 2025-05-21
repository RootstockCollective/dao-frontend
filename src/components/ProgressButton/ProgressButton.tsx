import { cn } from '@/lib/utils'
import { Span } from '../TypographyNew'
import { useInterval, useProgressAnimation } from './hooks'
import { AnimatedHourglassIcon, AnimatedProgressPattern } from './icons'

const PROGRESS_DURATION = 5000
const PROGRESS_FLIP_DURATION = 700
const HOURGLASS_FLIP_DURATION = 2000
const SIZE_CLASSES = 'w-64 h-12'

export const ProgressButton = () => {
  const progress = useProgressAnimation(PROGRESS_DURATION)
  const patternFlip = useInterval(PROGRESS_FLIP_DURATION)
  const hourglassFlip = useInterval(HOURGLASS_FLIP_DURATION)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-sm content-center bg-[#25221E] border border-[#66605C]',
        SIZE_CLASSES,
      )}
    >
      <div className={cn('absolute inset-y-0 left-0 overflow-hidden', SIZE_CLASSES)}>
        <AnimatedProgressPattern progress={progress} flip={patternFlip} />
      </div>

      <div className="relative z-10 flex items-center space-x-1 justify-center">
        <AnimatedHourglassIcon flip={hourglassFlip} />
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
