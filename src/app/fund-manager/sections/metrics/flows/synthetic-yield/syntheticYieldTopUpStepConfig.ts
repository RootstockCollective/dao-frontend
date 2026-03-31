import { parseEther } from 'viem'

import { FlowStepConfig } from '@/app/fund-manager/types'
import { RBTC } from '@/lib/constants'
import { syntheticYield } from '@/lib/contracts'

import { RbtcToken } from '../../hooks/useRbtcTokenSelection'
import { createConfirmStep } from '../createConfirmStep'
import { createDepositAmountStep } from '../createDepositAmountStep'
import { createRequestAllowanceStep } from '../createRequestAllowanceStep'
import { useSyntheticYieldTopUp } from './hooks/useSyntheticYieldTopUp'
import { useSyntheticYieldTopUpContext } from './SyntheticYieldTopUpContext'

const DepositAmountStep = createDepositAmountStep({
  contractAddress: syntheticYield.address,
  addressLabel: 'Synthetic Yield address',
  useFlowContext: useSyntheticYieldTopUpContext,
})

const RequestAllowanceStep = createRequestAllowanceStep({
  spenderAddress: syntheticYield.address,
  contractLabel: 'Synthetic Yield contract',
  useFlowContext: useSyntheticYieldTopUpContext,
})

const ConfirmDepositStep = createConfirmStep({
  useFlowContext: useSyntheticYieldTopUpContext,
  useTransaction: ({ amount, isNative }) => useSyntheticYieldTopUp(parseEther(amount), isNative),
  actionName: 'syntheticYieldTopUp',
  getRecipientAddress: () => syntheticYield.address,
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

export const getSyntheticYieldTopUpStepConfig = (selectedToken: RbtcToken): FlowStepConfig[] =>
  selectedToken === RBTC ? RBTC_STEP_CONFIG : WRBTC_STEP_CONFIG
