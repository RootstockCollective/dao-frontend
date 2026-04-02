'use client'

import { useMemo } from 'react'

import { FundManagerFlowModal } from '@/app/fund-manager/components'

import { TopUpBufferProvider, useTopUpBufferContext } from './TopUpBufferContext'
import { getTopUpBufferStepConfig } from './topUpBufferStepConfig'

interface Props {
  onClose: () => void
}

const TopUpBufferFlowContent = ({ onClose }: Props) => {
  const { selectedToken } = useTopUpBufferContext()
  const stepConfig = useMemo(() => getTopUpBufferStepConfig(selectedToken), [selectedToken])

  return <FundManagerFlowModal title="TOP UP BUFFER" stepConfig={stepConfig} onClose={onClose} />
}

export const TopUpBufferFlow = ({ onClose }: Props) => (
  <TopUpBufferProvider>
    <TopUpBufferFlowContent onClose={onClose} />
  </TopUpBufferProvider>
)
