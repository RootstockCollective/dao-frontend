'use client'

import { CaretRight } from '@/components/Icons/CaretRight'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

interface WithdrawStepsProps {
  currentStep: number
}

/**
 * Two-step indicator for the BTC vault withdrawal modal.
 * Mirrors the pattern from DepositSteps / StakeSteps.
 */
export const WithdrawSteps = ({ currentStep }: WithdrawStepsProps) => (
  <div className="flex justify-between items-center w-full">
    <Span variant="tag" caps className="whitespace-nowrap shrink-0 mr-1 text-text-100">
      SELECT AMOUNT
    </Span>

    <CaretRight className={cn('shrink-0 mr-1', currentStep >= 1 ? 'opacity-100' : 'opacity-60')} />

    <Span
      variant="tag"
      caps
      className={cn('whitespace-nowrap shrink-0', currentStep >= 1 ? 'text-text-100' : 'text-text-60')}
    >
      CONFIRM REQUEST
    </Span>
  </div>
)
