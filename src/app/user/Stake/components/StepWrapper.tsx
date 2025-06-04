import { Header, Paragraph } from '@/components/TypographyNew'
import { ProgressBar } from '@/components/ProgressBarNew'
import { StakeSteps } from '../Steps/StakeSteps'
import { useStakingContext } from '../StakingContext'
import { textsDependingOnAction } from '../Steps/stepsUtils'
import { memo, ReactNode, useMemo } from 'react'

interface StepWrapperProps {
  currentStep: 1 | 2 | 3
  progress: number
  description?: string
  children: ReactNode
}

export const StepWrapper = memo(function StepWrapper({
  currentStep,
  progress,
  description,
  children,
}: StepWrapperProps) {
  const { actionName } = useStakingContext()
  const actionTexts = useMemo(() => textsDependingOnAction[actionName], [actionName])

  return (
    <div className="p-6">
      <Header className="mt-16 mb-4">{actionTexts.modalTitle}</Header>

      <div className="mb-12">
        <StakeSteps currentStep={currentStep} />
        <ProgressBar progress={progress} className="mt-3" />
      </div>

      {description && (
        <Paragraph variant="body" className="mb-8">
          {description}
        </Paragraph>
      )}

      {children}
    </div>
  )
})
