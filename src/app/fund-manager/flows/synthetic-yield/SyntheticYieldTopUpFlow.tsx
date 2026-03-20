'use client'

import { useMemo } from 'react'

import { FundManagerFlowModal } from '../../components/FundManagerFlowModal'
import { SyntheticYieldTopUpProvider, useSyntheticYieldTopUpContext } from './SyntheticYieldTopUpContext'
import { getSyntheticYieldTopUpStepConfig } from './syntheticYieldTopUpStepConfig'

interface Props {
  onClose: () => void
}

const SyntheticYieldTopUpFlowContent = ({ onClose }: Props) => {
  const { selectedToken } = useSyntheticYieldTopUpContext()
  const stepConfig = useMemo(() => getSyntheticYieldTopUpStepConfig(selectedToken), [selectedToken])

  return <FundManagerFlowModal title="TOP UP SYNTHETIC YIELD APY" stepConfig={stepConfig} onClose={onClose} />
}

export const SyntheticYieldTopUpFlow = ({ onClose }: Props) => (
  <SyntheticYieldTopUpProvider>
    <SyntheticYieldTopUpFlowContent onClose={onClose} />
  </SyntheticYieldTopUpProvider>
)
