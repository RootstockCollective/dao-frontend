import { ComponentType } from 'react'

import { ButtonActions } from '@/components/StepActionButtons'

export type { ButtonActions } from '@/components/StepActionButtons'

export interface FlowStepProps {
  onGoNext: () => void
  onGoBack: () => void
  onGoToStep: (step: number) => void
  onCloseModal: () => void
  setButtonActions: (actions: ButtonActions) => void
}

export interface FlowStepConfig {
  component: ComponentType<FlowStepProps>
  label: string
  description: string
  progress: number
}
