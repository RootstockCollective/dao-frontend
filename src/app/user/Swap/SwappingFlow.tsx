import { useCallback, useMemo, useState } from 'react'

import { Divider } from '@/components/Divider'
import { Modal } from '@/components/Modal'
import { ProgressBar } from '@/components/ProgressBarNew'
import { StepActionButtons } from '@/components/StepActionButtons'
import { Header, Paragraph } from '@/components/Typography'
import { useSteps } from '@/shared/hooks/useSteps'
import { useSwapStore } from '@/shared/stores/swap'

import { useSwapSmartDefault } from './hooks/useSwapSmartDefault'
import { swapStepConfig } from './Steps/swapStepConfig'
import { SwapSteps } from './Steps/SwapSteps'
import { ButtonActions } from './types'

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
  useSwapSmartDefault()

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
