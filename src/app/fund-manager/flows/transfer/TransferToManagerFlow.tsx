'use client'

import { useMemo } from 'react'

import { FundManagerFlowModal } from '../../components/FundManagerFlowModal'
import { TransferToManagerProvider, useTransferToManagerContext } from './TransferToManagerContext'
import { getTransferToManagerStepConfig } from './transferToManagerStepConfig'

interface Props {
  onClose: () => void
}

const TransferToManagerFlowContent = ({ onClose }: Props) => {
  const { selectedToken } = useTransferToManagerContext()
  const stepConfig = useMemo(() => getTransferToManagerStepConfig(selectedToken), [selectedToken])

  return <FundManagerFlowModal title="TRANSFER TO MANAGER WALLET" stepConfig={stepConfig} onClose={onClose} />
}

export const TransferToManagerFlow = ({ onClose }: Props) => (
  <TransferToManagerProvider>
    <TransferToManagerFlowContent onClose={onClose} />
  </TransferToManagerProvider>
)
