import { Header, Paragraph } from '@/components/TypographyNew'
import { ProgressBar } from '@/components/ProgressBarNew'
import { ReactNode } from 'react'
import { StakeSteps } from '../Steps/StakeSteps'

interface Props {
  currentStep: number
  progress: number
  description?: string
  children: ReactNode
}

export const StepWrapper = ({ currentStep, progress, description, children }: Props) => (
  <div className="p-6">
    <Header className="mt-16 mb-4">STAKE</Header>

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
