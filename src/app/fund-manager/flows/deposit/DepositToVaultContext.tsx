'use client'

import { createAmountFlowContext } from '../createAmountFlowContext'

export const { Provider: DepositToVaultProvider, useFlowContext: useDepositToVaultContext } =
  createAmountFlowContext('DepositToVault')
