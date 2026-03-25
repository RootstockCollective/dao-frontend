'use client'

import { CaretRight } from '@/components/Icons/CaretRight'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface WithdrawStepsProps {
  /** 0 = amount, 1 = allowance, 2 = confirm */
  currentStep: number
}

/**
 * Three-step indicator for the BTC vault withdrawal modal.
 * Matches layout and motion from `StakeSteps` (DAO-2115).
 */
export const WithdrawSteps = ({ currentStep }: WithdrawStepsProps) => {
  const isDesktop = useIsDesktop()

  const getTransformOffset = () => {
    const offsets = [0, -18, -36]
    return offsets[currentStep] ?? 0
  }

  const transitionClasses = isDesktop ? '' : 'transition-transform duration-600 ease-in-out'
  const stepTransitionClasses = isDesktop ? '' : 'transition-all duration-400 ease-out'
  const transformStyle = isDesktop ? {} : { transform: `translateX(${getTransformOffset()}%)` }
  const containerClasses = isDesktop ? 'w-full' : 'w-screen -mx-6'
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

      <Span
        variant="tag"
        caps
        className={cn(
          'whitespace-nowrap flex-shrink-0 mr-1',
          currentStep >= 1 ? 'text-text-100 scale-100' : 'text-text-60 scale-98',
          stepTransitionClasses,
        )}
      >
        APPROVE SHARES
      </Span>

      <CaretRight
        className={cn(
          'flex-shrink-0 mr-1',
          currentStep >= 2 ? 'opacity-100 scale-100' : 'opacity-60 scale-98',
          stepTransitionClasses,
        )}
      />

      <Span
        variant="tag"
        caps
        className={cn(
          'whitespace-nowrap flex-shrink-0',
          currentStep === 2 ? 'text-text-100 scale-100' : 'text-text-60 scale-98',
          stepTransitionClasses,
        )}
      >
        CONFIRM WITHDRAW
      </Span>
    </div>
  )
}
