import { parseEther } from 'viem'

import { RBTC } from '@/lib/constants'
import { buffer } from '@/lib/contracts'

import { SelectedToken } from '../../hooks/useTokenSelection'
import { FlowStepConfig } from '../../types'
import { createConfirmStep } from '../createConfirmStep'
import { createDepositAmountStep } from '../createDepositAmountStep'
import { createRequestAllowanceStep } from '../createRequestAllowanceStep'
import { useTopUpBuffer } from './hooks/useTopUpBuffer'
import { useTopUpBufferContext } from './TopUpBufferContext'

const DepositAmountStep = createDepositAmountStep({
  contractAddress: buffer.address,
  addressLabel: 'Buffer address',
  useFlowContext: useTopUpBufferContext,
})

const RequestAllowanceStep = createRequestAllowanceStep({
  spenderAddress: buffer.address,
  contractLabel: 'Buffer Contract',
  actionName: 'bufferAllowance',
  useFlowContext: useTopUpBufferContext,
})

const ConfirmDepositStep = createConfirmStep({
  useFlowContext: useTopUpBufferContext,
  useTransaction: ({ amount, isNative }) => useTopUpBuffer(parseEther(amount), isNative),
  actionName: 'bufferTopUp',
  getRecipientAddress: () => buffer.address,
})

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

export const getTopUpBufferStepConfig = (selectedToken: SelectedToken): FlowStepConfig[] =>
  selectedToken === RBTC ? RBTC_STEP_CONFIG : WRBTC_STEP_CONFIG
