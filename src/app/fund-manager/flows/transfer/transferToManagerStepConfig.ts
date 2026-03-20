import { RBTC } from '@/lib/constants'

import { SelectedToken } from '../../hooks/useTokenSelection'
import { FlowStepConfig } from '../../types'
import { ConfirmTransferStep } from './steps/ConfirmTransferStep'
import { RecipientInfoStep } from './steps/RecipientInfoStep'
import { RequestAllowanceStep } from './steps/RequestAllowanceStep'

const RBTC_STEP_CONFIG: FlowStepConfig[] = [
  {
    component: RecipientInfoStep,
    label: 'Enter Recipient Info',
    description: '',
    progress: 50,
  },
  {
    component: ConfirmTransferStep,
    label: 'Confirm',
    description: 'Make sure that everything is correct before continuing:',
    progress: 100,
  },
]

const WRBTC_STEP_CONFIG: FlowStepConfig[] = [
  {
    component: RecipientInfoStep,
    label: 'Enter Recipient Info',
    description: '',
    progress: 28,
  },
  {
    component: RequestAllowanceStep,
    label: 'Request Allowance',
    description: 'Before you can allocate, you must first approve the allowance in your wallet.',
    progress: 68,
  },
  {
    component: ConfirmTransferStep,
    label: 'Confirm',
    description: 'Make sure that everything is correct before continuing:',
    progress: 100,
  },
]

export const getTransferToManagerStepConfig = (selectedToken: SelectedToken): FlowStepConfig[] =>
  selectedToken === RBTC ? RBTC_STEP_CONFIG : WRBTC_STEP_CONFIG
