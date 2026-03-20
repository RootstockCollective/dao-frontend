import { RBTC } from '@/lib/constants'

import { SelectedToken } from '../../hooks/useTokenSelection'
import { FlowStepConfig } from '../../types'
import { ConfirmDepositStep } from './steps/ConfirmDepositStep'
import { DepositAmountStep } from './steps/DepositAmountStep'
import { RequestAllowanceStep } from './steps/RequestAllowanceStep'

const RBTC_STEP_CONFIG: FlowStepConfig[] = [
  {
    component: DepositAmountStep,
    label: 'Deposit Amount',
    description: '',
    progress: 50,
  },
  {
    component: ConfirmDepositStep,
    label: 'Confirm Deposit',
    description: 'Make sure that everything is correct before continuing:',
    progress: 100,
  },
]

const WRBTC_STEP_CONFIG: FlowStepConfig[] = [
  {
    component: DepositAmountStep,
    label: 'Deposit Amount',
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
    component: ConfirmDepositStep,
    label: 'Confirm Deposit',
    description: 'Make sure that everything is correct before continuing:',
    progress: 100,
  },
]

export const getDepositToVaultStepConfig = (selectedToken: SelectedToken): FlowStepConfig[] =>
  selectedToken === RBTC ? RBTC_STEP_CONFIG : WRBTC_STEP_CONFIG
