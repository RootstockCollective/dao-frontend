import { parseEther } from 'viem'

import { FlowStepConfig } from '@/app/fund-manager/types'
import { RBTC } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'

import { RbtcToken } from '../../hooks/useRbtcTokenSelection'
import { createConfirmStep } from '../createConfirmStep'
import { createDepositAmountStep } from '../createDepositAmountStep'
import { createRequestAllowanceStep } from '../createRequestAllowanceStep'
import { useDepositToVaultContext } from './DepositToVaultContext'
import { useDepositToVault } from './hooks/useDepositToVault'

const DepositAmountStep = createDepositAmountStep({
  contractAddress: rbtcVault.address,
  addressLabel: 'Vault address',
  useFlowContext: useDepositToVaultContext,
})

const RequestAllowanceStep = createRequestAllowanceStep({
  spenderAddress: rbtcVault.address,
  contractLabel: 'Vault Contract',
  useFlowContext: useDepositToVaultContext,
})

const ConfirmDepositStep = createConfirmStep({
  useFlowContext: useDepositToVaultContext,
  useTransaction: ({ amount, isNative }) => useDepositToVault(parseEther(amount), isNative),
  actionName: 'vaultDeposit',
  getRecipientAddress: () => rbtcVault.address,
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

export const getDepositToVaultStepConfig = (selectedToken: RbtcToken): FlowStepConfig[] =>
  selectedToken === RBTC ? RBTC_STEP_CONFIG : WRBTC_STEP_CONFIG
