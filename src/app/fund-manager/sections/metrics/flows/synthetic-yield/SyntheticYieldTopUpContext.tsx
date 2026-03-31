'use client'

import { createAmountFlowContext } from '../createAmountFlowContext'

export const { Provider: SyntheticYieldTopUpProvider, useFlowContext: useSyntheticYieldTopUpContext } =
  createAmountFlowContext('SyntheticYieldTopUp')
