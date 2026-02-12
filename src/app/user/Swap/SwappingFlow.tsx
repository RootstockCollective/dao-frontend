import { Header, Paragraph } from '@/components/Typography'
import { ProgressBar } from '@/components/ProgressBarNew'
import { useMemo, useState, useCallback } from 'react'
import { SwapSteps } from './Steps/SwapSteps'
import { Modal } from '@/components/Modal'
import { swapStepConfig } from './Steps/swapStepConfig'
import { useSteps } from '@/app/user/Stake/hooks/useSteps'
import { StepActionButtons } from '@/app/user/Stake/components/StepActionButtons'
import { Divider } from '@/components/Divider'
import { ButtonActions } from './types'
import { useSwapStore } from '@/shared/stores/swap'

interface Props {
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

export const SwappingFlow = ({ onCloseModal }: Props) => {
  const [buttonActions, setButtonActions] = useState<ButtonActions>(DEFAULT_BUTTON_ACTIONS)
  const resetSwapStore = useSwapStore(state => state.reset)

  const { step, ...stepFunctions } = useSteps(swapStepConfig.length)

  const handleSetButtonActions = useCallback((actions: ButtonActions) => {
    setButtonActions(actions)
  }, [])

  // Reset store state when modal closes
  const handleCloseModal = useCallback(() => {
    resetSwapStore()
    onCloseModal()
  }, [resetSwapStore, onCloseModal])

  const stepConfigItem = useMemo(() => swapStepConfig[step], [step])
  const StepComponent = useMemo(() => stepConfigItem.component, [stepConfigItem.component])

  const { progress, description } = stepConfigItem

  return (
    <Modal onClose={handleCloseModal} data-testid="SwappingFlowModal">
      <div className="h-full flex flex-col p-4 md:p-6">
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
        <div className="flex-1">
          <StepComponent
            {...stepFunctions}
            onCloseModal={handleCloseModal}
            setButtonActions={handleSetButtonActions}
          />
        </div>

        {/* Footer with buttons */}
        <div className="mt-8">
          <Divider />
          <StepActionButtons buttonActions={buttonActions} />
        </div>
      </div>
    </Modal>
  )
}
