import { CaretRight } from '@/components/Icons/CaretRight'
import { Span } from '@/components/TypographyNew'

interface Props {
  currentStep: number
}

export const StakeSteps = ({ currentStep }: Props) => (
  <div className="flex justify-between items-center">
    <Span variant="tag">SELECT AMOUNT</Span>
    <CaretRight />
    <Span variant="tag" className={currentStep >= 1 ? '' : 'text-text-60'}>
      REQUEST ALLOWANCE
    </Span>
    <CaretRight />
    <Span variant="tag" className={currentStep >= 2 ? '' : 'text-text-60'}>
      CONFIRM STAKE
    </Span>
  </div>
)
