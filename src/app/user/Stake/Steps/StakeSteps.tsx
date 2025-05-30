import { CaretRight } from '@/components/Icons/CaretRight'
import { Span } from '@/components/TypographyNew'

interface StakeStepsProps {
  currentStep: 1 | 2 | 3
}

export const StakeSteps = ({ currentStep }: StakeStepsProps) => (
  <div className="flex justify-between items-center mb-12">
    <Span variant="tag" className={currentStep === 1 ? '' : 'text-text-60'}>
      SELECT AMOUNT
    </Span>
    <CaretRight />
    <Span variant="tag" className={currentStep === 2 ? '' : 'text-text-60'}>
      REQUEST ALLOWANCE
    </Span>
    <CaretRight />
    <Span variant="tag" className={currentStep === 3 ? '' : 'text-text-60'}>
      CONFIRM STAKE
    </Span>
  </div>
)
