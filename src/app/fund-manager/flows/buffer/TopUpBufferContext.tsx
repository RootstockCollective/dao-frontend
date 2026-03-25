'use client'

import { createAmountFlowContext } from '../createAmountFlowContext'

export const { Provider: TopUpBufferProvider, useFlowContext: useTopUpBufferContext } =
  createAmountFlowContext('TopUpBuffer')
