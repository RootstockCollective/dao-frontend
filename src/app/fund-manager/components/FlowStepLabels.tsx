import { Fragment } from 'react'

import { CaretRight } from '@/components/Icons/CaretRight'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

interface Props {
  labels: string[]
  currentStep: number
}

/**
 * Data-driven step label bar with chevron separators.
 */
export const FlowStepLabels = ({ labels, currentStep }: Props) => (
  <div className="flex justify-between items-center w-full">
    {labels.map((label, index) => (
      <Fragment key={`${label}-${index}`}>
        <Span
          variant="tag"
          caps
          className={cn(
            'whitespace-nowrap shrink-0',
            index > 0 && 'ml-1',
            index < labels.length - 1 && 'mr-1',
            index <= currentStep ? 'text-text-100' : 'text-text-60',
          )}
        >
          {label}
        </Span>
        {index < labels.length - 1 && (
          <CaretRight className={cn('shrink-0 mr-1', index < currentStep ? 'opacity-100' : 'opacity-60')} />
        )}
      </Fragment>
    ))}
  </div>
)
