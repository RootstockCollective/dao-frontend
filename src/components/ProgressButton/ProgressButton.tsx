import { cn } from '@/lib/utils'
import { Span } from '../TypographyNew'
import { AnimatedHourglassIcon, AnimatedProgressPattern } from './icons'

const SIZE_CLASSES = 'w-64 h-12'
export const ProgressButton = () => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-sm content-center bg-[#25221E] border border-[#66605C]',
        SIZE_CLASSES,
      )}
    >
      <div className={cn('absolute inset-y-0 left-0 overflow-hidden', SIZE_CLASSES)}>
        <AnimatedProgressPattern />
      </div>

      <div className="relative z-10 flex items-center space-x-1 justify-center">
        <AnimatedHourglassIcon />
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
