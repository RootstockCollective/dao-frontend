import { Header, Paragraph } from '@/components/TypographyNew'
import { ProgressBar } from '@/components/ProgressBarNew'
import { StakeSteps } from '../Steps/StakeSteps'
import { ReactNode } from 'react'

interface Props {
  currentStep: number
  progress: number
  description?: string
  children: ReactNode
  actionName?: 'STAKE' | 'UNSTAKE'
}

export const StepWrapper = ({
  currentStep,
  progress,
  description,
  children,
  actionName = 'STAKE',
}: Props) => (
  <div className="p-6">
    <Header className="mt-16 mb-4">{actionName}</Header>

    {actionName === 'STAKE' && (
      <div className="mb-12">
        <StakeSteps currentStep={currentStep} />
        <ProgressBar progress={progress} className="mt-3" />
      </div>
    )}

    {description && (
      <Paragraph variant="body" className="mb-8">
        {description}
      </Paragraph>
    )}

    {children}
  </div>
)
