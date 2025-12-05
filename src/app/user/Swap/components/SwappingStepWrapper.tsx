import { Header, Paragraph } from '@/components/Typography'
import { ProgressBar } from '@/components/ProgressBarNew'
import { useMemo, useState, useCallback } from 'react'
import { SwapSteps } from '../Steps/SwapSteps'
import { Modal } from '@/components/Modal'
import { swapStepConfig } from '../Steps/swapStepConfig'
import { useSteps } from '@/app/user/Stake/hooks/useSteps'
import { StepActionButtons } from '@/app/user/Stake/components/StepActionButtons'
import { Divider } from '@/components/Divider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { cn } from '@/lib/utils'
import { ButtonActions } from '../types'

interface SwappingStepWrapperProps {
  onCloseModal: () => void
}

const DEFAULT_BUTTON_ACTIONS: ButtonActions = {
  primary: {
    label: 'Continue',
    onClick: () => {},
    disabled: false,
    loading: false,
    isTxPending: false,
  },
}

export const SwappingStepWrapper = ({ onCloseModal }: SwappingStepWrapperProps) => {
  const isDesktop = useIsDesktop()
  const [buttonActions, setButtonActions] = useState<ButtonActions>(DEFAULT_BUTTON_ACTIONS)

  // UI Logic: Handle step management internally
  const { step, ...stepFunctions } = useSteps(swapStepConfig.length)

  // Memoize setButtonActions to ensure it's stable
  const handleSetButtonActions = useCallback((actions: ButtonActions) => {
    setButtonActions(actions)
  }, [])

  // UI Logic: Read step config and render component
  const stepConfigItem = useMemo(() => swapStepConfig[step], [step])
  const StepComponent = useMemo(() => stepConfigItem.component, [stepConfigItem.component])

  const { progress, description } = stepConfigItem

  return (
    <Modal onClose={onCloseModal} fullscreen={!isDesktop}>
      <div className={cn('h-full flex flex-col', !isDesktop ? 'p-4' : 'p-6')}>
        <Header className="mt-16 mb-4">SWAP</Header>

        <div className="mb-12">
          <SwapSteps currentStep={step} />
          <ProgressBar progress={progress} className="mt-3" />
        </div>

        {description && (
          <Paragraph variant="body" className="mb-8">
            {description}
          </Paragraph>
        )}

        {/* Content area */}
        <StepComponent
          {...stepFunctions}
          onCloseModal={onCloseModal}
          setButtonActions={handleSetButtonActions}
        />

        {/* Footer with buttons */}
        <div className="mt-8">
          <Divider />
          <StepActionButtons buttonActions={buttonActions} />
        </div>
      </div>
    </Modal>
  )
}
