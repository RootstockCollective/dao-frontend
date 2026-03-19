'use client'

import { useCallback, useMemo, useState } from 'react'

import { Divider } from '@/components/Divider'
import { Modal } from '@/components/Modal'
import { ProgressBar } from '@/components/ProgressBarNew'
import { StepActionButtons } from '@/components/StepActionButtons'
import { Header, Paragraph } from '@/components/Typography'
import { useSteps } from '@/shared/hooks/useSteps'

import { ButtonActions, FlowStepConfig } from '../types'
import { FlowStepLabels } from './FlowStepLabels'

const DEFAULT_BUTTON_ACTIONS: ButtonActions = {
  primary: {
    label: 'Continue',
    onClick: () => {},
    disabled: true,
  },
}

interface Props {
  title: string
  stepConfig: FlowStepConfig[]
  onClose: () => void
}

/**
 * Generic modal shell for fund-manager multi-step CTA flows.
 * Encapsulates step navigation, progress bar, step labels, and action buttons.
 * The stepConfig array can change at runtime (e.g. when switching between rBTC/WrBTC).
 */
export const FundManagerFlowModal = ({ title, stepConfig, onClose }: Props) => {
  const [buttonActions, setButtonActions] = useState<ButtonActions>(DEFAULT_BUTTON_ACTIONS)
  const { step, ...stepFunctions } = useSteps(stepConfig.length)

  const handleSetButtonActions = useCallback((actions: ButtonActions) => {
    setButtonActions(actions)
  }, [])

  const currentStepConfig = useMemo(() => stepConfig[step], [stepConfig, step])
  const StepComponent = currentStepConfig.component
  const labels = useMemo(() => stepConfig.map(s => s.label), [stepConfig])

  return (
    <Modal onClose={onClose} data-testid="FundManagerFlowModal">
      <div className="h-full flex flex-col p-4 md:p-6">
        <Header className="mt-16 mb-4">{title}</Header>

        <div className="mb-12">
          <FlowStepLabels labels={labels} currentStep={step} />
          <ProgressBar progress={currentStepConfig.progress} className="mt-3" />
        </div>

        {currentStepConfig.description && (
          <Paragraph className="mb-8">{currentStepConfig.description}</Paragraph>
        )}

        <div className="flex-1">
          <StepComponent
            {...stepFunctions}
            onCloseModal={onClose}
            setButtonActions={handleSetButtonActions}
          />
        </div>

        <div className="mt-8">
          <Divider />
          <StepActionButtons buttonActions={buttonActions} />
        </div>
      </div>
    </Modal>
  )
}
