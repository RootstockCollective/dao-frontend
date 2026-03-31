'use client'

import { useMemo } from 'react'

import { FundManagerFlowModal } from '@/app/fund-manager/components/FundManagerFlowModal'

import { DepositToVaultProvider, useDepositToVaultContext } from './DepositToVaultContext'
import { getDepositToVaultStepConfig } from './depositToVaultStepConfig'

interface Props {
  onClose: () => void
}

const DepositToVaultFlowContent = ({ onClose }: Props) => {
  const { selectedToken } = useDepositToVaultContext()
  const stepConfig = useMemo(() => getDepositToVaultStepConfig(selectedToken), [selectedToken])

  return <FundManagerFlowModal title="DEPOSIT TO VAULT" stepConfig={stepConfig} onClose={onClose} />
}

export const DepositToVaultFlow = ({ onClose }: Props) => (
  <DepositToVaultProvider>
    <DepositToVaultFlowContent onClose={onClose} />
  </DepositToVaultProvider>
)
