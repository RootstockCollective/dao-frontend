import { Address, parseEther } from 'viem'

import { FlowStepConfig } from '@/app/fund-manager/types'
import { RBTC } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'

import { RbtcToken } from '../../hooks/useRbtcTokenSelection'
import { createConfirmStep } from '../createConfirmStep'
import { createRequestAllowanceStep } from '../createRequestAllowanceStep'
import { useTransferToManager } from './hooks/useTransferToManager'
import { RecipientInfoStep } from './steps/RecipientInfoStep'
import { TransferToManagerContextValue, useTransferToManagerContext } from './TransferToManagerContext'

const RequestAllowanceStep = createRequestAllowanceStep({
  spenderAddress: rbtcVault.address,
  contractLabel: 'Vault Contract',
  useFlowContext: useTransferToManagerContext,
})

const ConfirmTransferStep = createConfirmStep<TransferToManagerContextValue>({
  useFlowContext: useTransferToManagerContext,
  useTransaction: ({ amount, isNative, recipientAddress }) =>
    useTransferToManager(parseEther(amount), isNative, recipientAddress as Address),
  actionName: 'transfer',
  getRecipientAddress: ({ recipientAddress }) => recipientAddress as Address,
})

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

export const getTransferToManagerStepConfig = (selectedToken: RbtcToken): FlowStepConfig[] =>
  selectedToken === RBTC ? RBTC_STEP_CONFIG : WRBTC_STEP_CONFIG
