import { CaretRight } from '@/components/Icons/CaretRight'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface Props {
  currentStep: number
}

export const SwapSteps = ({ currentStep }: Props) => {
  const isDesktop = useIsDesktop()

  const getTransformOffset = () => {
    const stepIndex = currentStep
    const offsets = [0, -18, -36]
    return offsets[stepIndex] || 0
  }

  // Only apply transitions and transforms on mobile
  const transitionClasses = isDesktop ? '' : 'transition-transform duration-600 ease-in-out'
  const stepTransitionClasses = isDesktop ? '' : 'transition-all duration-400 ease-out'

  // On desktop, don't move labels at all
  const transformStyle = isDesktop ? {} : { transform: `translateX(${getTransformOffset()}%)` }

  // On desktop, use Modal's width; on mobile, use w-screen for sliding
  const containerClasses = isDesktop ? 'w-full' : 'w-screen -mx-6'

  // On desktop, ensure first and last steps align with ProgressBar boundaries
  const stepLayoutClasses = isDesktop ? 'flex justify-between items-center' : ''

  const paddingClasses = isDesktop ? '' : 'px-6'

  return (
    <div
      className={cn(
        'relative flex items-center whitespace-nowrap flex-nowrap',
        containerClasses,
        stepLayoutClasses,
        paddingClasses,
        transitionClasses,
      )}
      style={transformStyle}
    >
      {/* Step 1: SELECT AMOUNT */}
      <Span
        variant="tag"
        caps
        className={cn(
          'whitespace-nowrap flex-shrink-0 mr-1',
          'text-text-100 scale-100',
          stepTransitionClasses,
        )}
      >
        SELECT AMOUNT
      </Span>

      <CaretRight
        className={cn(
          'flex-shrink-0 mr-1',
          currentStep >= 1 ? 'opacity-100 scale-100' : 'opacity-60 scale-98',
          stepTransitionClasses,
        )}
      />

      {/* Step 2: REQUEST ALLOWANCE */}
      <Span
        variant="tag"
        caps
        className={cn(
          'whitespace-nowrap flex-shrink-0 mr-1',
          currentStep >= 1 ? 'text-text-100 scale-100' : 'text-text-60 scale-98',
          stepTransitionClasses,
        )}
      >
        REQUEST ALLOWANCE
      </Span>

      <CaretRight
        className={cn(
          'flex-shrink-0 mr-1',
          currentStep >= 2 ? 'opacity-100 scale-100' : 'opacity-60 scale-98',
          stepTransitionClasses,
        )}
      />

      {/* Step 3: CONFIRM SWAP */}
      <Span
        variant="tag"
        caps
        className={cn(
          'whitespace-nowrap flex-shrink-0',
          currentStep === 2 ? 'text-text-100 scale-100' : 'text-text-60 scale-98',
          stepTransitionClasses,
        )}
      >
        CONFIRM SWAP
      </Span>
    </div>
  )
}

