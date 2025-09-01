import { CaretRight } from '@/components/Icons/CaretRight'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

interface Props {
  currentStep: number
}

export const StakeSteps = ({ currentStep }: Props) => {
  const getTransformOffset = () => {
    const stepIndex = currentStep
    const offsets = [0, -18, -36]
    return offsets[stepIndex] || 0
  }

  return (
    <div
      className="relative w-screen -ml-6 flex items-center transition-transform duration-600 ease-in-out whitespace-nowrap flex-nowrap"
      style={{
        transform: `translateX(${getTransformOffset()}%)`,
      }}
    >
      {/* Step 1: SELECT AMOUNT */}
      <Span
        variant="tag"
        caps
        className={cn(
          'transition-all duration-400 ease-out whitespace-nowrap flex-shrink-0 mr-2',
          'text-text-100 scale-100 ml-6',
        )}
      >
        SELECT AMOUNT
      </Span>

      <CaretRight
        className={cn(
          'flex-shrink-0 transition-all duration-400 ease-out mr-2',
          currentStep >= 1 ? 'opacity-100 scale-100' : 'opacity-60 scale-98',
        )}
      />

      {/* Step 2: REQUEST ALLOWANCE */}
      <Span
        variant="tag"
        caps
        className={cn(
          'transition-all duration-400 ease-out whitespace-nowrap flex-shrink-0 mr-2',
          currentStep >= 1 ? 'text-text-100 scale-100' : 'text-text-60 scale-98',
        )}
      >
        REQUEST ALLOWANCE
      </Span>

      <CaretRight
        className={cn(
          'flex-shrink-0 transition-all duration-400 ease-out mr-2',
          currentStep >= 2 ? 'opacity-100 scale-100' : 'opacity-60 scale-98',
        )}
      />

      {/* Step 3: CONFIRM STAKE */}
      <Span
        variant="tag"
        caps
        className={cn(
          'transition-all duration-400 ease-out whitespace-nowrap flex-shrink-0',
          currentStep === 2 ? 'text-text-100 scale-100' : 'text-text-60 scale-98',
        )}
      >
        CONFIRM STAKE
      </Span>
    </div>
  )
}
