import { Header, Paragraph } from '@/components/Typography'
import { ProgressBar } from '@/components/ProgressBarNew'
import { useMemo } from 'react'
import { StakeSteps } from '../Steps/StakeSteps'
import { Modal } from '@/components/Modal'
import { stepConfig } from '../Steps/stepConfig'
import { useSteps } from '../hooks/useSteps'
import { StepActionButtons } from './StepActionButtons'
import { Divider } from '@/components/Divider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface StepWrapperProps {
  onCloseModal: () => void
}

export const StepWrapper = ({ onCloseModal }: StepWrapperProps) => {
  const isDesktop = useIsDesktop()

  // UI Logic: Handle step management internally
  const { step, ...stepFunctions } = useSteps(stepConfig.length)

  // UI Logic: Read step config and render component
  const stepConfigItem = useMemo(() => stepConfig[step], [step])
  const StepComponent = useMemo(() => stepConfigItem.component, [stepConfigItem.component])

  const { progress, description, showDivider } = stepConfigItem

  return (
    <Modal onClose={onCloseModal} fullscreen={!isDesktop}>
      <div className="p-4 h-full flex flex-col">
        <Header className="mt-16 mb-4">STAKE</Header>

        <div className="mb-12">
          <StakeSteps currentStep={step} />
          <ProgressBar progress={progress} className="mt-3" />
        </div>

        {description && (
          <Paragraph variant="body" className="mb-8">
            {description}
          </Paragraph>
        )}

        {/* Content area */}
        <div className="flex-1">
          <StepComponent {...stepFunctions} onCloseModal={onCloseModal} />
        </div>

        {/* Footer with buttons */}
        {showDivider && <Divider className="mt-8" />}
        <StepActionButtons />
      </div>
    </Modal>
  )
}
