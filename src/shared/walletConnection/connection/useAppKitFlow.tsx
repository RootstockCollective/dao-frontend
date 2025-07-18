'use client'

import { useAlertContext } from '@/app/providers'
import { useAppKit } from '@reown/appkit/react'
import { useState } from 'react'
import { parseWalletConnectionError } from '../utils'

export const useAppKitFlow = () => {
  const [intermediateStep, setIntermediateStep] = useState<boolean>(false)
  const { open } = useAppKit()
  const { setMessage } = useAlertContext()
  const handleConnectWallet = () => {
    try {
      open()
    } catch (err) {
      setIntermediateStep(false)
      setMessage({
        severity: 'error',
        content: parseWalletConnectionError(err),
        title: 'Failed to connect to wallet',
      })
    }
  }

  const handleCloseIntermediateStep = () => {
    setIntermediateStep(false)
  }

  const onConnectWalletButtonClick = () => {
    setIntermediateStep(true)
  }

  return {
    intermediateStep,
    handleConnectWallet,
    handleCloseIntermediateStep,
    onConnectWalletButtonClick,
  }
}
